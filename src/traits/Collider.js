/**
 * Collider Trait - 当たり判定
 */
export class Collider {
  constructor(shape = 'Circle', options = {}) {
    this.shape = shape; // 'Circle', 'Rect'
    this.isTrigger = options.isTrigger || false;

    if (shape === 'Circle') {
      this.radius = options.radius || 16;
    } else if (shape === 'Rect') {
      this.width = options.width || 32;
      this.height = options.height || 32;
    }
  }
}
