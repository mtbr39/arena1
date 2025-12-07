import { System } from '../core/System.js';
import { Action } from '../core/Action.js';

/**
 * AreaAttackSystem - 範囲攻撃の処理（ダメージ判定と消滅）
 */
export class AreaAttackSystem extends System {
  constructor(world) {
    super(world);
  }

  update(deltaTime) {
    const areaAttacks = this.world.queryBits(bit => bit.hasTag('area-attack'));

    for (const attack of areaAttacks) {
      const pos = attack.getTrait('Position');
      if (!pos) continue;

      // 経過時間を更新
      attack.elapsed += deltaTime;

      // 範囲内の敵にダメージを与える（1回だけ）
      if (attack.hitTargets.size === 0 || attack.elapsed < 50) {
        this.applyAreaDamage(attack, pos);
      }

      // 持続時間が過ぎたら削除
      if (attack.elapsed >= attack.duration) {
        this.world.removeBit(attack.id);
      }
    }
  }

  /**
   * 範囲内の対象にダメージを与える
   */
  applyAreaDamage(attack, pos) {
    // 範囲内のすべてのBitを取得
    const allBits = this.world.getAllBits();

    for (const target of allBits) {
      // 自分自身はスキップ
      if (target.id === attack.id) continue;

      // 発射者はスキップ
      if (target.id === attack.ownerId) continue;

      // 既にダメージを与えた対象はスキップ
      if (attack.hitTargets.has(target.id)) continue;

      // 他の範囲攻撃はスキップ
      if (target.hasTag('area-attack')) continue;

      // projectileはスキップ
      if (target.hasTag('projectile')) continue;

      // Healthを持っていない対象はスキップ
      const health = target.getTrait('Health');
      if (!health) continue;

      // 位置を取得
      const targetPos = target.getTrait('Position');
      if (!targetPos) continue;

      // 距離を計算
      const dx = targetPos.x - pos.x;
      const dy = targetPos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 範囲内かチェック
      if (distance <= attack.radius) {
        // ダメージを与える
        const action = new Action(
          `area_hit_${Date.now()}_${attack.id}_${target.id}`,
          'Attack',
          attack.ownerId,
          [target.id],
          { damage: attack.damage }
        );
        this.world.enqueueAction(action);

        // ダメージを与えた対象を記録
        attack.hitTargets.add(target.id);
      }
    }
  }
}
