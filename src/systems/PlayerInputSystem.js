import { System } from '../core/System.js';
import { Action } from '../core/Action.js';
import { createProjectileBit } from '../entities/ProjectileBit.js';

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
    this.updateCooldowns(deltaTime);
    this.updateSkillInput();
    this.updateSkillTargetingMouse();
    this.updateClickInput();
  }

  /**
   * クールダウンを更新
   */
  updateCooldowns(deltaTime) {
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const skillTargeting = player.getTrait('SkillTargeting');
    if (skillTargeting) {
      skillTargeting.updateCooldowns(deltaTime);
    }
  }

  /**
   * スキルターゲティング中のマウス位置を更新
   */
  updateSkillTargetingMouse() {
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const skillTargeting = player.getTrait('SkillTargeting');
    if (!skillTargeting || !skillTargeting.isTargeting) return;

    const { x, y } = this.inputManager.getMousePosition();
    skillTargeting.updateMousePosition(x, y);
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

    // スキル設定を取得
    const skillConfig = player.getTrait('SkillConfig');
    if (!skillConfig) return;
    const config = skillConfig.getSkill(skillSlot);

    // 方向ベクトルを計算
    const dx = targetPos.x - playerPos.x;
    const dy = targetPos.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 正規化
    const dirX = dx / distance;
    const dirY = dy / distance;

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

    // クールダウン開始
    const skillTargeting = player.getTrait('SkillTargeting');
    if (skillTargeting) {
      skillTargeting.startCooldown(skillSlot, config.cooldown);
    }

    console.log(`Skill ${skillSlot} (${config.name}) fired!`);
  }

  /**
   * スキルキー入力を処理
   */
  updateSkillInput() {
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const skillTargeting = player.getTrait('SkillTargeting');
    if (!skillTargeting) return;

    const skillConfig = player.getTrait('SkillConfig');
    if (!skillConfig) return;

    // スキルキーの処理(wasKeyPressed を使ってフレーム単位で検知)
    if (this.inputManager.wasKeyPressed('q')) {
      this.startSkillTargeting(player, skillTargeting, skillConfig, 'Q');
    } else if (this.inputManager.wasKeyPressed('w')) {
      this.startSkillTargeting(player, skillTargeting, skillConfig, 'W');
    } else if (this.inputManager.wasKeyPressed('e')) {
      this.startSkillTargeting(player, skillTargeting, skillConfig, 'E');
    }
  }

  /**
   * スキルターゲティングを開始（インジケーター設定付き）
   */
  startSkillTargeting(player, skillTargeting, skillConfig, skillSlot) {
    // クールダウン中は開始できない
    if (skillTargeting.isOnCooldown(skillSlot)) {
      const remaining = Math.ceil(skillTargeting.getCooldownRemaining(skillSlot) / 1000);
      console.log(`Skill ${skillSlot} is on cooldown (${remaining}s)`);
      return;
    }

    const config = skillConfig.getSkill(skillSlot);

    skillTargeting.startTargeting(
      skillSlot,
      config.indicatorType,
      {
        color: config.color,
        range: config.range,
        width: config.indicatorWidth
      }
    );

    // 現在のマウス位置を即座に設定
    const { x, y } = this.inputManager.getMousePosition();
    skillTargeting.updateMousePosition(x, y);

    console.log(`Skill ${skillSlot}: Click to target direction`);
  }
}
