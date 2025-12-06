/**
 * AttackLine - 攻撃時の視覚エフェクト(線)
 */
export class AttackLine {
  constructor(targetId, duration = 500, color = '#ffff00') {
    this.targetId = targetId; // 攻撃対象のBit ID
    this.duration = duration; // 表示時間(ミリ秒)
    this.color = color; // 線の色
    this.createdTime = Date.now(); // 作成時刻
    this.lineWidth = 2; // 線の太さ
  }

  /**
   * まだ表示すべきか判定
   */
  isExpired() {
    return Date.now() - this.createdTime >= this.duration;
  }

  /**
   * 残り時間の割合(0.0~1.0)
   */
  getRemainingRatio() {
    const elapsed = Date.now() - this.createdTime;
    return Math.max(0, 1 - elapsed / this.duration);
  }
}
