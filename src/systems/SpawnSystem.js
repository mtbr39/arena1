/**
 * SpawnSystem - 一定間隔で敵と味方を自動生成
 */
export class SpawnSystem {
  constructor(world, config = {}) {
    this.world = world;

    // スポーン設定
    this.enemySpawnInterval = config.enemySpawnInterval || 5000; // 5秒ごと
    this.allySpawnInterval = config.allySpawnInterval || 7000; // 7秒ごと

    // 一度にスポーンする数
    this.enemySpawnCount = config.enemySpawnCount || 2; // 敵は一度に2匹
    this.allySpawnCount = config.allySpawnCount || 2; // 味方も一度に2匹

    this.lastEnemySpawnTime = 0;
    this.lastAllySpawnTime = 0;

    // スポーン位置の範囲
    this.enemySpawnArea = config.enemySpawnArea || {
      minX: 100,
      maxX: 700,
      minY: -800,
      maxY: -600
    };

    this.allySpawnArea = config.allySpawnArea || {
      minX: 200,
      maxX: 600,
      minY: 500,
      maxY: 700
    };

    // スポーン用のファクトリ関数を保持
    this.enemyFactories = config.enemyFactories || [];
    this.allyFactories = config.allyFactories || [];
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update() {
    const now = Date.now();

    // 敵のスポーン
    if (now - this.lastEnemySpawnTime >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.lastEnemySpawnTime = now;
    }

    // 味方のスポーン
    if (now - this.lastAllySpawnTime >= this.allySpawnInterval) {
      this.spawnAlly();
      this.lastAllySpawnTime = now;
    }
  }

  /**
   * 敵をスポーン(複数匹)
   */
  spawnEnemy() {
    if (this.enemyFactories.length === 0) return;

    // 指定された数だけスポーン
    for (let i = 0; i < this.enemySpawnCount; i++) {
      // ランダムなファクトリを選択
      const factory = this.enemyFactories[Math.floor(Math.random() * this.enemyFactories.length)];

      // ランダムな位置を生成
      const x = this.enemySpawnArea.minX + Math.random() * (this.enemySpawnArea.maxX - this.enemySpawnArea.minX);
      const y = this.enemySpawnArea.minY + Math.random() * (this.enemySpawnArea.maxY - this.enemySpawnArea.minY);

      // 敵を生成
      const enemy = factory(this.world, x, y);
      this.world.addBit(enemy);
    }
  }

  /**
   * 味方をスポーン(複数匹)
   */
  spawnAlly() {
    if (this.allyFactories.length === 0) return;

    // 指定された数だけスポーン
    for (let i = 0; i < this.allySpawnCount; i++) {
      // ランダムなファクトリを選択
      const factory = this.allyFactories[Math.floor(Math.random() * this.allyFactories.length)];

      // ランダムな位置を生成
      const x = this.allySpawnArea.minX + Math.random() * (this.allySpawnArea.maxX - this.allySpawnArea.minX);
      const y = this.allySpawnArea.minY + Math.random() * (this.allySpawnArea.maxY - this.allySpawnArea.minY);

      // 味方を生成
      const ally = factory(this.world, x, y);
      this.world.addBit(ally);
    }
  }

  /**
   * スポーン間隔を変更
   */
  setSpawnInterval(enemyInterval, allyInterval) {
    if (enemyInterval !== undefined) {
      this.enemySpawnInterval = enemyInterval;
    }
    if (allyInterval !== undefined) {
      this.allySpawnInterval = allyInterval;
    }
  }
}
