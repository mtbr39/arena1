/**
 * SkillTargeting - スキルのターゲティング状態
 */
export class SkillTargeting {
  constructor() {
    this.isTargeting = false;  // ターゲティング中か
    this.skillSlot = null;      // どのスキル(Q/W/E)か
  }

  /**
   * ターゲティング開始
   */
  startTargeting(skillSlot) {
    this.isTargeting = true;
    this.skillSlot = skillSlot;
  }

  /**
   * ターゲティング終了
   */
  endTargeting() {
    this.isTargeting = false;
    this.skillSlot = null;
  }
}
