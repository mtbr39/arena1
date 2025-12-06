/**
 * Sprite Trait - 見た目(スプライト)
 */
export class Sprite {
  constructor(color = '#ffffff', width = 32, height = 32, shape = 'rect') {
    this.color = color;
    this.width = width;
    this.height = height;
    this.shape = shape; // 'rect', 'circle'
  }
}
