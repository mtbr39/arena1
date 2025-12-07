import { System } from '../core/System.js';

/**
 * RepulsionSystem - ユニット同士が重ならないように斥力を適用
 * 各BitのColliderサイズに基づいて斥力の範囲を計算
 */
export class RepulsionSystem extends System {
  constructor(world) {
    super(world);
    this.repulsionStrength = 0.5; // 斥力の強さ
    this.marginMultiplier = 1.2; // サイズの何倍の距離まで斥力を働かせるか
  }

  /**
   * BitのColliderから半径を取得
   * @param {Bit} bit
   * @returns {number} 半径（Colliderがない場合はデフォルト値）
   */
  getBitRadius(bit) {
    const collider = bit.getTrait('Collider');
    if (!collider) return 16; // デフォルト半径

    if (collider.shape === 'Circle') {
      return collider.radius;
    } else if (collider.shape === 'Rect') {
      // 矩形の場合は対角線の半分を半径として使用
      return Math.sqrt(collider.width * collider.width + collider.height * collider.height) / 2;
    }
    return 16;
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update(deltaTime) {
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

      // BitAのサイズを取得
      const radiusA = this.getBitRadius(bitA);

      // 他のすべてのcreatureとの距離をチェック
      for (let j = 0; j < creatures.length; j++) {
        if (i === j) continue; // 自分自身はスキップ

        const bitB = creatures[j];
        const posB = bitB.getTrait('Position');
        if (!posB) continue;

        // BitBのサイズを取得
        const radiusB = this.getBitRadius(bitB);

        // 2つのBitのサイズを考慮した斥力範囲を計算
        const combinedRadius = (radiusA + radiusB) * this.marginMultiplier;

        // 距離を計算
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 斥力が働く範囲内かチェック
        if (distance > 0 && distance < combinedRadius) {
          // 距離が近いほど強い斥力
          const force = (combinedRadius - distance) / combinedRadius;
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
