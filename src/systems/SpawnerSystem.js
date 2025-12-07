import { System } from '../core/System.js';

/**
 * SpawnerSystem - Spawner Traitを持つBitを監視してスポーンを実行
 *
 * このSystemは、世界中のすべてのSpawnerを持つBitをチェックし、
 * スポーン可能なものを自動的にスポーンさせる
 */
export class SpawnerSystem extends System {
  constructor(world) {
    super(world);
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update(deltaTime) {
    // Spawner Traitを持つすべてのBitを取得
    const spawners = this.world.queryBits(bit => bit.hasTrait('Spawner'));

    for (const bit of spawners) {
      const spawner = bit.getTrait('Spawner');

      // スポーン可能かチェック
      if (spawner.canSpawn()) {
        // スポーン実行
        const spawnedBits = spawner.spawn(this.world, bit);

        // スポーンイベントを発火(必要に応じて)
        if (spawnedBits.length > 0) {
          this.onSpawn(bit, spawnedBits);
        }
      }
    }
  }

  /**
   * スポーン時のコールバック(拡張用)
   * @param {Bit} spawnerBit - スポーンしたBit
   * @param {Bit[]} spawnedBits - スポーンされたBitの配列
   */
  onSpawn(spawnerBit, spawnedBits) {
    // デバッグログやエフェクト生成などに使える
    // console.log(`${spawnerBit.name} spawned ${spawnedBits.length} bits`);
  }
}
