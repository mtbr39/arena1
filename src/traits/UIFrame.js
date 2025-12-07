/**
 * UIFrame Trait - UI要素の枠
 */
export class UIFrame {
  constructor(width = 100, height = 40, zIndex = 100, backgroundColor = null, borderColor = null) {
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.visible = true;
    this.backgroundColor = backgroundColor; // null = デフォルト色使用
    this.borderColor = borderColor;         // null = デフォルト色使用
  }
}
