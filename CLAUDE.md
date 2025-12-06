# Bit World - 設計ドキュメント

## コアコンセプト

このプロジェクトは「**Bit と Action だけでゲーム世界を回す**」という思想で設計されています。

### 根本原則

1. **世界に存在するものはすべて Bit**
   - プレイヤー、敵、アイテム、地形、UI、エフェクト、当たり判定など
   - 種別を表す enum や type フラグは基本的に持たない

2. **Bit は「性質の集合」として定義される**
   - 「何であるか」ではなく「何を持っているか」で振る舞いが決まる
   - 例: `Health` + `Position` + `TagSet["creature"]` = 生き物
   - 例: `UIFrame` + `Label` + `InputReceiver` = UIボタン

3. **Action は Bit 間の関係と変化を表す**
   - すべての世界の変化は Action を通して実行される
   - Action 自体もデータ化され、Resolver で処理される

## アーキテクチャ

### レイヤー構造

```
世界の変化
    ↑
  Action (Move, Attack, Click, etc.)
    ↑
  Bit (性質の集合)
    ↑
  Trait (Position, Health, Sprite, etc.)
```

### ディレクトリ構成の意味

- `core/`: Bit, Action, World など、システムの根幹
- `traits/`: Bit が持つ「性質」の定義
- `actions/`: ActionKind の定義(どういう行為がどう処理されるか)
- `entities/`: よくある Bit の構成パターン(プリセット)
- `systems/`: 描画、入力など、World 全体に作用する処理

## 設計思想

### Trait による構成

Trait は「その Bit が何者として振る舞えるか」を決定します。

- **組み合わせで複雑な存在を表現**: 単一の Trait は単純に保つ
- **依存関係を最小化**: Trait 同士はできるだけ独立させる
- **構造による判定**: 「～かどうか」は Trait の有無や TagSet で判定

### Action の処理フロー

1. Action が World の actionQueue に追加される
2. ActionResolver が Action を取り出す
3. ActionKind の `validate()` で実行可能か判定
4. Bit 個別の `onAction` ハンドラを実行(あれば)
5. ActionKind の `resolve()` で共通処理を実行
6. 世界の状態が変化する

### クエリ思想

「村」「モンスター」「UI」といった概念は、型ではなく**構造への問い合わせ**で判定します。

- `world.queryBits(bit => bit.hasTrait('Health'))` で HP を持つ全 Bit
- `world.queryBits(bit => bit.hasTag('player'))` でプレイヤー
- `world.getBitsAtPosition(x, y, layer)` で特定位置の Bit

**→ ラベルではなく構造で世界を理解する**

## 拡張の方針

### 新しい機能を追加するとき

1. **新しい性質が必要か?** → `traits/` に Trait を追加
2. **新しい行為が必要か?** → `actions/` に ActionKind を追加
3. **新しい Bit パターンが必要か?** → `entities/` にファクトリ関数を追加
4. **新しいグローバル処理が必要か?** → `systems/` に System を追加

### 避けるべきこと

- ❌ Bit に `type: "player"` のような種別フラグを追加
- ❌ `if (bit instanceof PlayerBit)` のような型チェック
- ❌ Action を経由せずに直接 Bit の状態を変更
- ❌ グローバル状態への依存

### 推奨されること

- ✅ Trait の組み合わせで新しい存在を表現
- ✅ 構造への問い合わせ(クエリ)で判定
- ✅ すべての変化を Action 経由で実行
- ✅ 小さく独立した Trait を組み合わせる

## 重要な実装パターン

### Bit の作り方

```javascript
const bit = new Bit(id, name, desc);
bit.addTrait('Position', new Position(x, y));
bit.addTrait('Health', new Health(100));
bit.addTrait('TagSet', new TagSet(['creature']));
bit.setActionHandler('Attack', (world, action) => { /* 処理 */ });
world.addBit(bit);
```

### Action の発行

```javascript
const action = new Action(
  'unique_id',
  'ActionKindId',  // 'Move', 'Attack' など
  actorBitId,
  [targetBitId1, targetBitId2],
  { /* params */ }
);
world.enqueueAction(action);
```

### ActionKind の定義

```javascript
export const CustomAction = new ActionKind(
  'CustomActionId',
  'Custom Action Name',
  (world, action) => { /* validate */ return true; },
  (world, action) => { /* resolve - 世界を変化させる */ }
);
```

## レイヤーの概念

- **layer 0**: ゲーム世界(カメラの影響を受ける)
- **layer 1**: UI(スクリーン座標固定)
- 必要に応じてレイヤーを増やせる

Position の `layer` プロパティで制御します。

## 「UIも攻撃できる」の実現方法

UIButton も Bit なので:
- `Health` Trait を持たせる
- `onAction.Attack` ハンドラを登録
- `Collider` で当たり判定を持つ

→ 他の Bit と全く同じ仕組みで攻撃・破壊が可能

## まとめ

この設計の本質は**「区別をなくすこと」**です。

- プレイヤーと敵の区別をなくす → どちらも Bit
- ゲーム世界と UI の区別をなくす → どちらも Bit
- 移動と攻撃の区別をなくす → どちらも Action

**構造の問い合わせ**によって振る舞いを決定することで、柔軟で拡張性の高いシステムが実現されます。
