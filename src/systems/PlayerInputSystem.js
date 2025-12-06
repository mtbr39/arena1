import { System } from '../core/System.js';
import { Action } from '../core/Action.js';
import { createProjectileBit } from '../entities/ProjectileBit.js';

// スキルごとの設定
const SKILL_CONFIG = {
  Q: { color: '#ff6600', size: 14, speed: 8, damage: 25, range: 400, name: 'Fire' },
  W: { color: '#66ccff', size: 16, speed: 6, damage: 30, range: 350, name: 'Ice' },
  E: { color: '#99ff66', size: 10, speed: 12, damage: 15, range: 500, name: 'Wind' }
};

/**
 * PlayerInputSystem - プレイヤーの入力を処理するゲーム固有ロジック
 */
export class PlayerInputSystem extends System {
  constructor(world, inputManager, renderSystem) {
    super(world);
    this.inputManager = inputManager;
    this.renderSystem = renderSystem;
  }

  update(deltaTime) {
    this.updateSkillInput();
    this.updatePlayerMovement();
    this.updateClickInput();
  }

  /**
   * クリック入力処理
   */
  updateClickInput() {
    if (!this.inputManager.wasMousePressed()) return;

    const { x: clickX, y: clickY } = this.inputManager.getMousePosition();

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

      // 移動コマンドを出したので攻撃対象をクリア
      const attackTarget = player.getTrait('AttackTarget');
      if (attackTarget) {
        attackTarget.clear();
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

    if (this.inputManager.isKeyDown('w') || this.inputManager.isKeyDown('arrowup')) dy -= speed;
    if (this.inputManager.isKeyDown('s') || this.inputManager.isKeyDown('arrowdown')) dy += speed;
    if (this.inputManager.isKeyDown('a') || this.inputManager.isKeyDown('arrowleft')) dx -= speed;
    if (this.inputManager.isKeyDown('d') || this.inputManager.isKeyDown('arrowright')) dx += speed;

    if (dx !== 0 || dy !== 0) {
      // キーボード移動中はクリック移動をキャンセル
      const movementTarget = player.getTrait('MovementTarget');
      if (movementTarget) {
        movementTarget.clear();
      }

      // キーボード移動中は攻撃対象もキャンセル
      const attackTarget = player.getTrait('AttackTarget');
      if (attackTarget) {
        attackTarget.clear();
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

    // スキルキーの処理(wasKeyPressed を使ってフレーム単位で検知)
    if (this.inputManager.wasKeyPressed('q')) {
      skillTargeting.startTargeting('Q');
      console.log('Skill Q: Click to target direction');
    } else if (this.inputManager.wasKeyPressed('w')) {
      skillTargeting.startTargeting('W');
      console.log('Skill W: Click to target direction');
    } else if (this.inputManager.wasKeyPressed('e')) {
      skillTargeting.startTargeting('E');
      console.log('Skill E: Click to target direction');
    }
  }
}
