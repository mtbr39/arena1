import { Bit } from '../core/Bit.js';
import { Spawner } from '../traits/Spawner.js';

/**
 * WorldSpawnerBit - 見えないスポーナー
 *
 * このBitは世界に存在するが、視覚的には見えない。
 * Spawner Traitを持ち、タワーなどのグローバルなスポーンを管理する。
 *
 * 使用例:
 * - タワーを定期的にスポーン
 * - ボスを定期的にスポーン
 * - イベント時に特殊なユニットをスポーン
 */

/**
 * 汎用的なWorld Spawner Bitを作成
 * @param {World} world
 * @param {Object} spawnerConfig - Spawner Traitの設定
 * @param {string} name - スポーナーの名前
 * @returns {Bit}
 */
export function createWorldSpawnerBit(world, spawnerConfig, name = 'World Spawner') {
  const bit = new Bit(world.generateBitId(), name, 'Invisible spawner for global entities');

  // Spawner Traitのみを持つ（見えない、動かない、攻撃もできない）
  bit.addTrait('Spawner', new Spawner(spawnerConfig));

  return bit;
}

/**
 * Tower専用のWorld Spawner
 * 定期的にランダムな場所にタワーをスポーン
 */
export function createTowerWorldSpawner(world, towerFactory) {
  return createWorldSpawnerBit(world, {
    spawnInterval: 30000,    // 30秒ごと
    spawnCount: 1,           // 一度に1つ
    spawnFactories: [towerFactory],
    spawnArea: {
      minX: -1000,
      maxX: 1000,
      minY: -1000,
      maxY: 1000
    },
    enabled: true,
    maxSpawnCount: null      // 無制限
  }, 'Tower Spawner');
}

/**
 * Boss専用のWorld Spawner
 * 定期的にランダムな場所にボスをスポーン
 */
export function createBossWorldSpawner(world, bossFactory) {
  return createWorldSpawnerBit(world, {
    spawnInterval: 30000,    // 60秒ごと
    spawnCount: 1,           // 一度に1つ
    spawnFactories: [bossFactory],
    spawnArea: {
      minX: 100,
      maxX: 700,
      minY: -800,
      maxY: -400
    },
    enabled: true,
    maxSpawnCount: null      // 無制限
  }, 'Boss Spawner');
}
