import { Action } from '../core/Action.js';
import { AttackLine } from '../traits/AttackLine.js';

/**
 * CombatSystem - 戦闘処理(攻撃対象への接近と攻撃)
 */
export class CombatSystem {
  constructor(world) {
    this.world = world;
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update() {
    // 期限切れの攻撃線を削除
    this.cleanupExpiredAttackLines();

    // AttackTargetを持つすべてのBitを処理
    const combatants = this.world.queryBits(bit =>
      bit.hasTrait('AttackTarget') && bit.hasTrait('Position')
    );

    for (const bit of combatants) {
      const attackTarget = bit.getTrait('AttackTarget');
      if (!attackTarget.hasTarget()) continue;

      const targetBit = this.world.getBit(attackTarget.targetId);

      // ターゲットが存在しないか死んでいる場合はクリア
      if (!targetBit) {
        attackTarget.clear();
        const movementTarget = bit.getTrait('MovementTarget');
        if (movementTarget) {
          movementTarget.clear();
        }
        continue;
      }

      const targetHealth = targetBit.getTrait('Health');
      if (targetHealth && targetHealth.current <= 0) {
        attackTarget.clear();
        const movementTarget = bit.getTrait('MovementTarget');
        if (movementTarget) {
          movementTarget.clear();
        }
        continue;
      }

      // 距離を計算
      const pos = bit.getTrait('Position');
      const targetPos = targetBit.getTrait('Position');
      if (!pos || !targetPos) continue;

      const dx = targetPos.x - pos.x;
      const dy = targetPos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 攻撃範囲内かチェック
      if (distance <= attackTarget.attackRange) {
        // 攻撃範囲内 → 攻撃クールダウンをチェック(AttackTargetに統合)
        if (attackTarget.canAttack()) {
          // 攻撃実行
          const action = new Action(
            `attack_${Date.now()}_${bit.id}`,
            'Attack',
            bit.id,
            [targetBit.id],
            {
              damage: attackTarget.attackDamage
            }
          );
          this.world.enqueueAction(action);

          // クールダウンを記録
          attackTarget.onAttack();

          // 攻撃線を追加(AIの場合のみ - playerタグを持たない場合)
          if (!bit.hasTag('player')) {
            // 既存の攻撃線があれば削除
            if (bit.hasTrait('AttackLine')) {
              bit.removeTrait('AttackLine');
            }
            // 新しい攻撃線を追加
            bit.addTrait('AttackLine', new AttackLine(targetBit.id, 500, '#ffff00'));
          }
        }

        // 移動を停止(攻撃範囲内にいるので移動不要)
        const movementTarget = bit.getTrait('MovementTarget');
        if (movementTarget) {
          movementTarget.clear();
        }
      } else {
        // 攻撃範囲外 → ターゲットに向かって移動
        const movementTarget = bit.getTrait('MovementTarget');
        if (movementTarget) {
          // 攻撃範囲ぎりぎりまで近づく
          const stopDistance = attackTarget.attackRange - 5;
          const ratio = stopDistance / distance;
          const targetX = pos.x + dx * ratio;
          const targetY = pos.y + dy * ratio;
          movementTarget.setTarget(targetX, targetY);
        }
      }
    }
  }

  /**
   * 期限切れの攻撃線を削除
   */
  cleanupExpiredAttackLines() {
    const bitsWithAttackLine = this.world.queryBits(bit =>
      bit.hasTrait('AttackLine')
    );

    for (const bit of bitsWithAttackLine) {
      const attackLine = bit.getTrait('AttackLine');
      if (attackLine.isExpired()) {
        bit.removeTrait('AttackLine');
      }
    }
  }
}
