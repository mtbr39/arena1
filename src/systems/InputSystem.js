import { Action } from '../core/Action.js';
import { createProjectileBit } from '../entities/ProjectileBit.js';

// スキルごとの設定
const SKILL_CONFIG = {
  Q: { color: '#ff6600', size: 14, speed: 8, damage: 25, range: 400, name: 'Fire' },
  W: { color: '#66ccff', size: 16, speed: 6, damage: 30, range: 350, name: 'Ice' },
  E: { color: '#99ff66', size: 10, speed: 12, damage: 15, range: 500, name: 'Wind' }
};

/**
 * InputSystem - マウス・キーボード入力を管理
 */
export class InputSystem {
  constructor(canvas, world, renderSystem) {
    this.canvas = canvas;
    this.world = world;
    this.renderSystem = renderSystem;

    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;

    this.keys = new Set();

    this.setupEventListeners();
  }

  setupEventListeners() {
    // マウス移動
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    // マウスクリック
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseDown = true;
      this.handleClick(e);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseDown = false;
    });

    // タッチイベント(スマホ対応)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0  // 左クリック相当
      };
      this.handleClick(touchEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
    });

    // キーボード
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  /**
   * クリック処理
   */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // プレイヤーを探す
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    // スキルターゲティング中かチェック
    const skillTargeting = player.getTrait('SkillTargeting');
    if (skillTargeting && skillTargeting.isTargeting) {
      // スキルの方向指定
      const worldPos = this.renderSystem.screenToWorld(clickX, clickY, 0);
      this.castSkill(player, skillTargeting.skillSlot, worldPos);
      skillTargeting.endTargeting();
      return;
    }

    // レイヤー1(UI)を優先的にチェック
    let targets = this.world.getBitsAtPosition(clickX, clickY, 1);
    let worldPos = null;

    // UIがなければレイヤー0をチェック
    if (targets.length === 0) {
      worldPos = this.renderSystem.screenToWorld(clickX, clickY, 0);
      targets = this.world.getBitsAtPosition(worldPos.x, worldPos.y, 0);
    }

    if (targets.length > 0) {
      // ターゲットがある場合の処理
      const target = targets[0];

      // 敵(creature タグを持つ)をクリックした場合は攻撃対象に設定
      if (target.hasTag('creature') && !target.hasTag('player')) {
        const attackTarget = player.getTrait('AttackTarget');
        if (attackTarget) {
          attackTarget.setTarget(target.id);
        }
      } else {
        // UIやその他のBitをクリック → Clickアクション
        const action = new Action(
          `click_${Date.now()}`,
          'Click',
          player.id,
          [target.id],
          {
            mouseX: clickX,
            mouseY: clickY
          }
        );
        this.world.enqueueAction(action);
      }
    } else {
      // ターゲットがない場合: その場所を目標地点として設定
      if (!worldPos) {
        worldPos = this.renderSystem.screenToWorld(clickX, clickY, 0);
      }

      // MovementTargetに目標地点を設定
      const movementTarget = player.getTrait('MovementTarget');
      if (movementTarget) {
        movementTarget.setTarget(worldPos.x, worldPos.y);
      }
    }
  }

  /**
   * スキル発動
   */
  castSkill(player, skillSlot, targetPos) {
    const playerPos = player.getTrait('Position');
    if (!playerPos) return;

    // 方向ベクトルを計算
    const dx = targetPos.x - playerPos.x;
    const dy = targetPos.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 正規化
    const dirX = dx / distance;
    const dirY = dy / distance;

    // スキル設定を取得
    const config = SKILL_CONFIG[skillSlot] || SKILL_CONFIG.Q;

    // 弾を生成
    const projectile = createProjectileBit(
      this.world,
      playerPos.x,
      playerPos.y,
      dirX,
      dirY,
      {
        color: config.color,
        size: config.size,
        speed: config.speed,
        damage: config.damage,
        range: config.range,
        skillType: skillSlot
      }
    );
    projectile.ownerId = player.id;
    this.world.addBit(projectile);

    console.log(`Skill ${skillSlot} (${config.name}) fired!`);
  }

  /**
   * キーボード入力でプレイヤーを移動
   */
  updatePlayerMovement() {
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const speed = 3;
    let dx = 0;
    let dy = 0;

    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= speed;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += speed;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= speed;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += speed;

    if (dx !== 0 || dy !== 0) {
      // キーボード移動中はクリック移動をキャンセル
      const movementTarget = player.getTrait('MovementTarget');
      if (movementTarget) {
        movementTarget.clear();
      }

      const action = new Action(
        `move_${Date.now()}`,
        'Move',
        player.id,
        [],
        { dx, dy }
      );

      this.world.enqueueAction(action);
    }
  }

  /**
   * スキルキー入力を処理
   */
  updateSkillInput() {
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const skillTargeting = player.getTrait('SkillTargeting');
    if (!skillTargeting) return;

    // スキルキーの処理
    if (this.keys.has('q')) {
      this.keys.delete('q');
      skillTargeting.startTargeting('Q');
      console.log('Skill Q: Click to target direction');
    } else if (this.keys.has('w')) {
      this.keys.delete('w');
      skillTargeting.startTargeting('W');
      console.log('Skill W: Click to target direction');
    } else if (this.keys.has('e')) {
      this.keys.delete('e');
      skillTargeting.startTargeting('E');
      console.log('Skill E: Click to target direction');
    }
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update() {
    this.updateSkillInput();
    this.updatePlayerMovement();
  }
}
