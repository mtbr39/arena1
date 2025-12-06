/**
 * AttackTarget - 攻撃対象
 */
export class AttackTarget {
  constructor() {
    this.targetId = null;
    this.attackRange = 50; // 攻撃範囲
  }

  /**
   * 攻撃対象が設定されているか
   */
  hasTarget() {
    return this.targetId !== null;
  }

  /**
   * 攻撃対象をクリア
   */
  clear() {
    this.targetId = null;
  }

  /**
   * 攻撃対象を設定
   */
  setTarget(targetId) {
    this.targetId = targetId;
  }
}
