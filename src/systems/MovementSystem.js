/**
 * MovementSystem - 目標地点への移動を処理
 */
export class MovementSystem {
  constructor(world) {
    this.world = world;
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update() {
    // MovementTargetを持つすべてのBitを処理
    const movingBits = this.world.queryBits(bit =>
      bit.hasTrait('MovementTarget') && bit.hasTrait('Position')
    );

    for (const bit of movingBits) {
      const target = bit.getTrait('MovementTarget');
      const pos = bit.getTrait('Position');

      if (!target.hasTarget()) continue;

      // 目標地点までの距離と方向を計算
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 移動速度(MovementTargetに統合)
      const speed = target.speed;

      // 目標地点に十分近い場合は到着とみなす
      if (distance < speed) {
        pos.x = target.x;
        pos.y = target.y;
        target.clear();
      } else {
        // 正規化した方向ベクトルに速度をかけて移動
        const dirX = dx / distance;
        const dirY = dy / distance;
        pos.x += dirX * speed;
        pos.y += dirY * speed;
      }
    }
  }
}
