import { System } from '../core/System.js';
import { Action } from '../core/Action.js';

/**
 * ProjectileSystem - 弾の移動と衝突処理
 */
export class ProjectileSystem extends System {
  /**
   * 更新(毎フレーム呼ぶ)
   */
  update(deltaTime) {
    const projectiles = this.world.queryBits(bit => bit.hasTag('projectile'));

    for (const projectile of projectiles) {
      const pos = projectile.getTrait('Position');
      if (!pos || !projectile.velocity) continue;

      // 移動
      pos.x += projectile.velocity.x;
      pos.y += projectile.velocity.y;

      // 移動距離を記録
      const moveDistance = Math.sqrt(
        projectile.velocity.x * projectile.velocity.x +
        projectile.velocity.y * projectile.velocity.y
      );
      projectile.distanceTraveled += moveDistance;

      // 最大射程を超えたら削除
      if (projectile.distanceTraveled >= projectile.maxRange) {
        this.world.removeBit(projectile.id);
        continue;
      }

      // 衝突判定
      const hitTargets = this.world.getBitsAtPosition(pos.x, pos.y, 0);
      for (const target of hitTargets) {
        // 自分自身、他の弾、発射者はスキップ
        if (target.id === projectile.id) continue;
        if (target.hasTag('projectile')) continue;
        if (target.id === projectile.ownerId) continue;

        // Healthを持つBitにダメージ
        const health = target.getTrait('Health');
        if (health) {
          const action = new Action(
            `projectile_hit_${Date.now()}_${projectile.id}`,
            'Attack',
            projectile.ownerId,
            [target.id],
            { damage: projectile.damage }
          );
          this.world.enqueueAction(action);

          // 弾を削除
          this.world.removeBit(projectile.id);
          break;
        }
      }
    }
  }
}
