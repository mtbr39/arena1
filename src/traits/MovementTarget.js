/**
 * MovementTarget - 移動目標地点
 */
export class MovementTarget {
  constructor(x = null, y = null) {
    this.x = x;
    this.y = y;
  }

  /**
   * 目標地点が設定されているか
   */
  hasTarget() {
    return this.x !== null && this.y !== null;
  }

  /**
   * 目標地点をクリア
   */
  clear() {
    this.x = null;
    this.y = null;
  }

  /**
   * 目標地点を設定
   */
  setTarget(x, y) {
    this.x = x;
    this.y = y;
  }
}
