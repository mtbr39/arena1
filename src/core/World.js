/**
 * World - Bitの集合とActionの管理
 */
export class World {
  constructor() {
    this.bits = new Map(); // BitId -> Bit
    this.actionQueue = []; // 処理待ちAction
    this.actionKinds = new Map(); // ActionKindId -> ActionKind
    this.nextBitId = 0;
  }

  /**
   * Bitを追加
   */
  addBit(bit) {
    this.bits.set(bit.id, bit);
    return bit;
  }

  /**
   * Bitを取得
   */
  getBit(id) {
    return this.bits.get(id);
  }

  /**
   * 全Bitを取得
   */
  getAllBits() {
    return Array.from(this.bits.values()).filter(bit => bit.active);
  }

  /**
   * 条件に合うBitを検索
   */
  queryBits(predicate) {
    return this.getAllBits().filter(predicate);
  }

  /**
   * 位置にあるBitを検索
   */
  getBitsAtPosition(x, y, layer = 0) {
    return this.queryBits(bit => {
      const pos = bit.getTrait('Position');
      const collider = bit.getTrait('Collider');
      if (!pos) return false;

      if (pos.layer !== layer) return false;

      if (!collider) {
        // コライダーがない場合は点で判定
        return Math.abs(pos.x - x) < 5 && Math.abs(pos.y - y) < 5;
      }

      // コライダーで判定
      if (collider.shape === 'Circle') {
        const dx = pos.x - x;
        const dy = pos.y - y;
        return dx * dx + dy * dy <= collider.radius * collider.radius;
      } else if (collider.shape === 'Rect') {
        return x >= pos.x - collider.width / 2 &&
               x <= pos.x + collider.width / 2 &&
               y >= pos.y - collider.height / 2 &&
               y <= pos.y + collider.height / 2;
      }

      return false;
    });
  }

  /**
   * ActionKindを登録
   */
  registerActionKind(actionKind) {
    this.actionKinds.set(actionKind.id, actionKind);
  }

  /**
   * Actionをキューに追加
   */
  enqueueAction(action) {
    this.actionQueue.push(action);
  }

  /**
   * Actionを処理
   */
  processActions(resolver) {
    const actions = [...this.actionQueue];
    this.actionQueue = [];

    for (const action of actions) {
      resolver.resolve(this, action);
    }

    // 非アクティブなBitを削除
    for (const [id, bit] of this.bits.entries()) {
      if (!bit.active) {
        this.bits.delete(id);
      }
    }
  }

  /**
   * ユニークなBit IDを生成
   */
  generateBitId() {
    return `bit_${this.nextBitId++}`;
  }
}
