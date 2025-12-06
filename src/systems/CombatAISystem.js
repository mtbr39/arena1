/**
 * CombatAISystem - すべてのcreatureの自動ターゲット選択と行動AI
 * 敵・味方の区別なく、「自分と異なる陣営の最も近い敵」を攻撃する
 */
export class CombatAISystem {
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

    // AttackTargetを持つすべてのcreatureを取得(player以外)
    const creatures = this.world.queryBits(bit =>
      bit.hasTag('creature') &&
      !bit.hasTag('player') && // プレイヤーは手動操作なので除外
      bit.hasTrait('Position') &&
      bit.hasTrait('AttackTarget')
    );

    for (const creature of creatures) {
      const attackTarget = creature.getTrait('AttackTarget');

      // すでにターゲットがいる場合は有効性をチェック
      if (attackTarget.hasTarget()) {
        const currentTarget = this.world.getBit(attackTarget.targetId);
        if (currentTarget) {
          const targetHealth = currentTarget.getTrait('Health');
          // ターゲットが生きていれば継続
          if (targetHealth && targetHealth.current > 0) {
            continue;
          }
        }
        // ターゲットが無効なのでクリア
        attackTarget.clear();
      }

      // 最も近い敵対勢力を探す
      const target = this.findNearestEnemy(creature);
      if (target) {
        attackTarget.setTarget(target.id);
      }
    }
  }

  /**
   * 最も近い敵対勢力を探す
   * 陣営判定:
   * - enemy vs (player, ally)
   * - ally vs enemy
   */
  findNearestEnemy(bit) {
    const pos = bit.getTrait('Position');
    if (!pos) return null;

    // 自分の陣営を判定
    const isEnemy = bit.hasTag('enemy');
    const isAlly = bit.hasTag('ally');

    // 敵対勢力を探す
    const potentialTargets = this.world.queryBits(target => {
      // 自分自身は除外
      if (target.id === bit.id) return false;

      // creatureタグを持つか
      if (!target.hasTag('creature')) return false;

      // 生存しているか
      const health = target.getTrait('Health');
      if (health && health.current <= 0) return false;

      // 陣営判定:
      // enemyは player と ally を攻撃
      if (isEnemy && (target.hasTag('player') || target.hasTag('ally'))) {
        return true;
      }

      // allyは enemy を攻撃
      if (isAlly && target.hasTag('enemy')) {
        return true;
      }

      return false;
    });

    if (potentialTargets.length === 0) return null;

    // 最も近いターゲットを見つける
    let nearestTarget = null;
    let nearestDistance = Infinity;
    const searchRange = 4000; // 探索範囲

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
