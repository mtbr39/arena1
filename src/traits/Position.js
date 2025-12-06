/**
 * Position Trait - 位置情報
 */
export class Position {
  constructor(x = 0, y = 0, z = 0, layer = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.layer = layer; // レイヤー(0: ゲーム世界, 1: UI など)
  }
}
