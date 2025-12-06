/**
 * RepulsionSystem - ユニット同士が重ならないように斥力を適用
 */
export class RepulsionSystem {
  constructor(world) {
    this.world = world;
    this.repulsionRadius = 40; // 斥力が働く距離
    this.repulsionStrength = 0.5; // 斥力の強さ
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update() {
    // creature タグを持つすべてのBitを取得
    const creatures = this.world.queryBits(bit =>
      bit.hasTag('creature') && bit.hasTrait('Position')
    );

    // 各creatureに対して他のcreatureとの斥力を計算
    for (let i = 0; i < creatures.length; i++) {
      const bitA = creatures[i];
      const posA = bitA.getTrait('Position');
      if (!posA) continue;

      let totalRepulsionX = 0;
      let totalRepulsionY = 0;

      // 他のすべてのcreatureとの距離をチェック
      for (let j = 0; j < creatures.length; j++) {
        if (i === j) continue; // 自分自身はスキップ

        const bitB = creatures[j];
        const posB = bitB.getTrait('Position');
        if (!posB) continue;

        // 距離を計算
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 斥力が働く範囲内かチェック
        if (distance > 0 && distance < this.repulsionRadius) {
          // 距離が近いほど強い斥力
          const force = (this.repulsionRadius - distance) / this.repulsionRadius;
          const repulsionX = (dx / distance) * force * this.repulsionStrength;
          const repulsionY = (dy / distance) * force * this.repulsionStrength;

          totalRepulsionX += repulsionX;
          totalRepulsionY += repulsionY;
        }
      }

      // 斥力を位置に適用
      if (totalRepulsionX !== 0 || totalRepulsionY !== 0) {
        posA.x += totalRepulsionX;
        posA.y += totalRepulsionY;
      }
    }
  }
}
