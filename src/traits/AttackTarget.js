/**
 * AttackTarget - 攻撃対象とクールダウンと攻撃力
 */
export class AttackTarget {
  constructor(attackRange = 50, cooldownTime = 1000, attackDamage = 15) {
    this.targetId = null;
    this.attackRange = attackRange; // 攻撃範囲
    this.cooldownTime = cooldownTime; // クールダウン時間(ミリ秒)
    this.attackDamage = attackDamage; // 攻撃力
    this.lastAttackTime = 0; // 最後に攻撃した時刻
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

  /**
   * 攻撃可能か判定
   */
  canAttack() {
    const now = Date.now();
    return now - this.lastAttackTime >= this.cooldownTime;
  }

  /**
   * 攻撃実行時に呼ぶ
   */
  onAttack() {
    this.lastAttackTime = Date.now();
  }

  /**
   * クールダウンをリセット
   */
  resetCooldown() {
    this.lastAttackTime = 0;
  }
}
