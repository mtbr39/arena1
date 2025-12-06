/**
 * EnemyAISystem - 敵の自動ターゲット選択と行動AI
 */
export class EnemyAISystem {
  constructor(world) {
    this.world = world;
    this.targetSearchInterval = 500; // 0.5秒ごとにターゲット検索
    this.lastSearchTime = 0;
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update() {
    const now = Date.now();

    // 一定間隔でターゲット検索を実行
    if (now - this.lastSearchTime < this.targetSearchInterval) {
      return;
    }
    this.lastSearchTime = now;

    // 敵タグを持つすべてのBitを取得
    const enemies = this.world.queryBits(bit =>
      bit.hasTag('enemy') && bit.hasTrait('Position') && bit.hasTrait('AttackTarget')
    );

    for (const enemy of enemies) {
      const attackTarget = enemy.getTrait('AttackTarget');

      // すでにターゲットがいる場合はスキップ
      if (attackTarget.hasTarget()) {
        // ターゲットが有効かチェック
        const currentTarget = this.world.getBit(attackTarget.targetId);
        if (currentTarget) {
          const targetHealth = currentTarget.getTrait('Health');
          if (!targetHealth || targetHealth.current > 0) {
            continue; // 有効なターゲットがいるので次の敵へ
          }
        }
        // ターゲットが無効なのでクリア
        attackTarget.clear();
      }

      // 近くの敵(自分以外のcreature)を探す
      const target = this.findNearestEnemy(enemy);
      if (target) {
        attackTarget.setTarget(target.id);
      }
    }
  }

  /**
   * 最も近い敵を探す
   */
  findNearestEnemy(bit) {
    const pos = bit.getTrait('Position');
    if (!pos) return null;

    // 自分にとっての敵 = 自分と異なる陣営のcreature
    // 敵タグを持つBitはplayerタグを持つBitを狙う
    const potentialTargets = this.world.queryBits(target => {
      // 自分自身は除外
      if (target.id === bit.id) return false;

      // creatureタグを持つか
      if (!target.hasTag('creature')) return false;

      // 生存しているか
      const health = target.getTrait('Health');
      if (health && health.current <= 0) return false;

      // 敵はplayerを狙う、playerはenemyを狙う
      if (bit.hasTag('enemy') && target.hasTag('player')) {
        return true;
      }
      if (bit.hasTag('player') && target.hasTag('enemy')) {
        return true;
      }

      return false;
    });

    if (potentialTargets.length === 0) return null;

    // 最も近いターゲットを見つける
    let nearestTarget = null;
    let nearestDistance = Infinity;
    const searchRange = 300; // 探索範囲

    for (const target of potentialTargets) {
      const targetPos = target.getTrait('Position');
      if (!targetPos) continue;

      const dx = targetPos.x - pos.x;
      const dy = targetPos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance && distance <= searchRange) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }

    return nearestTarget;
  }
}
