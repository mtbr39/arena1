/**
 * UIFrame Trait - UI要素の枠
 */
export class UIFrame {
  constructor(width = 100, height = 40, zIndex = 100) {
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.visible = true;
  }
}
