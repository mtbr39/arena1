/**
 * Spawner Trait - スポーン能力
 *
 * このTraitを持つBitは、一定間隔で他のBitを生成できる
 * 使用例:
 * - Bossが雑魚敵を召喚
 * - 建物がユニットを生産
 * - トラップが敵を出現させる
 */
export class Spawner {
  constructor(config = {}) {
    // スポーン間隔(ミリ秒)
    this.spawnInterval = config.spawnInterval || 5000;

    // 一度にスポーンする数
    this.spawnCount = config.spawnCount || 1;

    // スポーンするBitのファクトリ関数の配列
    // 例: [createEnemyBit, createAllyBit]
    this.spawnFactories = config.spawnFactories || [];

    // スポーン範囲(相対座標)
    // nullの場合は自分の位置にスポーン
    this.spawnArea = config.spawnArea || null;
    // 例: { minX: -50, maxX: 50, minY: -50, maxY: 50 }

    // 最後にスポーンした時刻
    this.lastSpawnTime = 0;

    // スポーン可能かどうか(一時的に停止できる)
    this.enabled = config.enabled !== undefined ? config.enabled : true;

    // 最大スポーン数(nullなら無制限)
    this.maxSpawnCount = config.maxSpawnCount || null;

    // これまでにスポーンした総数
    this.totalSpawned = 0;
  }

  /**
   * スポーン可能か判定
   */
  canSpawn() {
    if (!this.enabled) return false;
    if (this.spawnFactories.length === 0) return false;
    if (this.maxSpawnCount !== null && this.totalSpawned >= this.maxSpawnCount) return false;

    const now = Date.now();
    return now - this.lastSpawnTime >= this.spawnInterval;
  }

  /**
   * スポーン実行(SpawnerSystemから呼ばれる)
   * @param {World} world
   * @param {Bit} ownerBit - このSpawnerを持つBit
   * @returns {Bit[]} スポーンされたBitの配列
   */
  spawn(world, ownerBit) {
    const spawnedBits = [];
    const ownerPos = ownerBit.getTrait('Position');

    // 指定された数だけスポーン
    for (let i = 0; i < this.spawnCount; i++) {
      // ランダムなファクトリを選択
      const factory = this.spawnFactories[Math.floor(Math.random() * this.spawnFactories.length)];

      // スポーン位置を決定
      let spawnX, spawnY;

      if (this.spawnArea) {
        // 範囲指定がある場合
        if (ownerPos) {
          // オーナーの位置を基準に相対位置を計算
          const offsetX = this.spawnArea.minX + Math.random() * (this.spawnArea.maxX - this.spawnArea.minX);
          const offsetY = this.spawnArea.minY + Math.random() * (this.spawnArea.maxY - this.spawnArea.minY);
          spawnX = ownerPos.x + offsetX;
          spawnY = ownerPos.y + offsetY;
        } else {
          // オーナーがPositionを持たない場合は、spawnAreaを絶対座標として扱う
          spawnX = this.spawnArea.minX + Math.random() * (this.spawnArea.maxX - this.spawnArea.minX);
          spawnY = this.spawnArea.minY + Math.random() * (this.spawnArea.maxY - this.spawnArea.minY);
        }
      } else {
        // 範囲指定がない場合
        if (ownerPos) {
          // オーナーの位置にスポーン
          spawnX = ownerPos.x;
          spawnY = ownerPos.y;
        } else {
          // PositionもspawnAreaもない場合は警告して原点にスポーン
          console.warn('Spawner: Owner bit has no Position trait and no spawnArea specified', ownerBit.id);
          spawnX = 0;
          spawnY = 0;
        }
      }

      // Bitを生成
      const newBit = factory(world, spawnX, spawnY);
      world.addBit(newBit);
      spawnedBits.push(newBit);

      this.totalSpawned++;
    }

    // 最後のスポーン時刻を更新
    this.lastSpawnTime = Date.now();

    return spawnedBits;
  }

  /**
   * スポーンを有効化/無効化
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * スポーン間隔を変更
   */
  setSpawnInterval(interval) {
    this.spawnInterval = interval;
  }

  /**
   * ファクトリを追加
   */
  addFactory(factory) {
    this.spawnFactories.push(factory);
  }

  /**
   * すべてのファクトリをクリア
   */
  clearFactories() {
    this.spawnFactories = [];
  }

  /**
   * スポーンカウンタをリセット
   */
  resetSpawnCount() {
    this.totalSpawned = 0;
  }
}
