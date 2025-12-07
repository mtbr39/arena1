# Spawner Trait ガイド

## 概要

`Spawner` Traitは、Bitにスポーン能力を付与する性質です。このTraitを持つBitは、一定間隔で他のBitを自動的に生成できます。

## 設計思想

従来のグローバルな`SpawnSystem`と異なり、**スポーン能力自体をTraitとして持たせる**ことで：

- ✅ Bossが雑魚を召喚
- ✅ 建物がユニットを生産
- ✅ トラップが敵を出現させる
- ✅ プレイヤーが召喚魔法を使う

など、すべて同じ仕組みで実現できます。

## アーキテクチャ

```
┌─────────────────┐
│  SpawnerSystem  │ ← すべてのSpawner Traitを持つBitを監視
└─────────────────┘
         │
         ├─→ Boss (Spawner Trait) ─→ Enemy Minion を召喚
         ├─→ Tower (Spawner Trait) ─→ Ally Minion を生産
         └─→ Trap (Spawner Trait) ─→ 敵をスポーン
```

## 使い方

### 基本的な使用例

```javascript
import { Spawner } from '../traits/Spawner.js';
import { createEnemyMinionBit } from './UnitBit.js';

const boss = new Bit(id, 'Boss', 'A powerful boss');

// Spawner Traitを追加
boss.addTrait('Spawner', new Spawner({
  spawnInterval: 5000,     // 5秒ごと
  spawnCount: 2,           // 一度に2体
  spawnFactories: [createEnemyMinionBit], // 何を召喚するか
  spawnArea: {             // どこに召喚するか（相対座標）
    minX: -100,
    maxX: 100,
    minY: -100,
    maxY: 100
  },
  enabled: true,           // スポーン有効
  maxSpawnCount: null      // 無制限（または数値で制限）
}));
```

### Spawner設定オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `spawnInterval` | number | 5000 | スポーン間隔（ミリ秒） |
| `spawnCount` | number | 1 | 一度にスポーンする数 |
| `spawnFactories` | Function[] | [] | スポーン用ファクトリ関数の配列 |
| `spawnArea` | Object\|null | null | スポーン範囲（相対座標）、nullの場合は自分の位置 |
| `enabled` | boolean | true | スポーン有効/無効 |
| `maxSpawnCount` | number\|null | null | 最大スポーン数（nullで無制限） |

### スポーン範囲の指定

```javascript
// 自分の位置を基準とした相対座標
spawnArea: {
  minX: -100,  // 左に100px
  maxX: 100,   // 右に100px
  minY: -100,  // 上に100px
  maxY: 100    // 下に100px
}

// nullの場合は自分の位置にそのままスポーン
spawnArea: null
```

### 複数種類のBitをランダムスポーン

```javascript
boss.addTrait('Spawner', new Spawner({
  spawnInterval: 3000,
  spawnCount: 1,
  spawnFactories: [
    createEnemyMinionBit,
    createEnemyRangedBit,
    createFlyingEnemyBit  // ランダムに選ばれる
  ]
}));
```

## 実装例

### 1. Boss（敵の召喚者）

```javascript
export function createBossEnemyBit(world, x, y) {
  const boss = createTowerBit(world, x, y, 'Boss', '...', '#ff0000', 'enemy', 300, 20);

  boss.addTrait('Spawner', new Spawner({
    spawnInterval: 5000,
    spawnCount: 2,
    spawnFactories: [createEnemyMinionBit],
    spawnArea: { minX: -100, maxX: 100, minY: -100, maxY: 100 }
  }));

  return boss;
}
```

### 2. Tower（味方の生産建物）

```javascript
export function createTowerAllyBit(world, x, y) {
  const tower = createTowerBit(world, x, y, 'Tower', '...', '#00ff00', 'ally', 300, 20);

  tower.addTrait('Spawner', new Spawner({
    spawnInterval: 7000,
    spawnCount: 2,
    spawnFactories: [createAllyMinionBit],
    spawnArea: { minX: -80, maxX: 80, minY: -80, maxY: 80 }
  }));

  return tower;
}
```

### 3. 制限付きスポーン（トラップなど）

```javascript
const trap = new Bit(id, 'Trap', 'Spawns 5 enemies then stops');

trap.addTrait('Spawner', new Spawner({
  spawnInterval: 2000,
  spawnCount: 1,
  spawnFactories: [createEnemyBit],
  maxSpawnCount: 5  // 5体スポーンしたら停止
}));
```

## Spawner Traitのメソッド

### `canSpawn(): boolean`
スポーン可能かを判定（間隔、有効/無効、最大数チェック）

### `spawn(world, ownerBit): Bit[]`
実際のスポーンを実行し、生成されたBitの配列を返す

### `setEnabled(enabled: boolean)`
スポーンの有効/無効を切り替え

```javascript
const spawner = boss.getTrait('Spawner');
spawner.setEnabled(false); // スポーン停止
spawner.setEnabled(true);  // スポーン再開
```

### `setSpawnInterval(interval: number)`
スポーン間隔を動的に変更

```javascript
spawner.setSpawnInterval(10000); // 10秒間隔に変更
```

### `addFactory(factory: Function)`
ファクトリを追加

```javascript
spawner.addFactory(createNewEnemyTypeBit);
```

### `clearFactories()`
すべてのファクトリをクリア

### `resetSpawnCount()`
スポーンカウンタをリセット

## SpawnerSystemの役割

`SpawnerSystem`は、毎フレーム以下を実行します：

1. 世界中の全Bitから`Spawner` Traitを持つものを検索
2. 各Spawnerに対して`canSpawn()`をチェック
3. スポーン可能なら`spawn()`を実行

```javascript
// main.jsでの登録
new SpawnerSystem(this.world);
```

## 応用例

### ボスのHP減少で召喚速度アップ

```javascript
boss.setActionHandler('Attack', (world, action) => {
  const health = boss.getTrait('Health');
  const spawner = boss.getTrait('Spawner');

  // HP50%以下で召喚速度2倍
  if (health.current < health.max / 2) {
    spawner.setSpawnInterval(2500); // 5秒→2.5秒
  }
});
```

### プレイヤーが召喚魔法を使う

```javascript
const player = createPlayerBit(world, x, y);

// 召喚魔法のスキル使用時
player.addTrait('Spawner', new Spawner({
  spawnInterval: 999999, // 手動制御するため長く設定
  spawnCount: 3,
  spawnFactories: [createSummonedCreatureBit],
  enabled: false // デフォルト無効
}));

// スキル発動時
function activateSummonSkill() {
  const spawner = player.getTrait('Spawner');
  spawner.spawn(world, player); // 手動でスポーン実行
}
```

### ウェーブごとに敵を変える

```javascript
const portal = new Bit(id, 'Portal', 'Enemy spawner');

portal.addTrait('Spawner', new Spawner({
  spawnInterval: 5000,
  spawnCount: 3,
  spawnFactories: [createEnemyBit] // 初期はWeakEnemy
}));

// ウェーブ2開始時
function startWave2() {
  const spawner = portal.getTrait('Spawner');
  spawner.clearFactories();
  spawner.addFactory(createStrongEnemyBit);
  spawner.addFactory(createFlyingEnemyBit);
}
```

## まとめ

`Spawner` Traitによって：

- ✅ **スポーン能力がBit自身の性質**になる
- ✅ **グローバルな制御が不要**（各Bitが独立）
- ✅ **動的な変更が容易**（enable/disable、間隔変更など）
- ✅ **Bit World設計思想に沿った実装**（性質の集合で振る舞いを決定）

「スポーンするもの」も「スポーンされるもの」も、すべて等しくBitです。
