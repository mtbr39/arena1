/**
 * MovementTarget - 移動目標地点と速度
 */
export class MovementTarget {
  constructor(x = null, y = null, speed = 0.5) {
    this.x = x;
    this.y = y;
    this.speed = speed;
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
