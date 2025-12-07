/**
 * インジケーターの種類
 * - direction: 方向指定（矢印）
 * - range: 範囲指定（円）
 * - area: エリア指定（長方形など）
 */
export const IndicatorType = {
  DIRECTION: 'direction',
  RANGE: 'range',
  AREA: 'area'
};

/**
 * SkillTargeting - スキルのターゲティング状態とクールダウン管理
 */
export class SkillTargeting {
  constructor() {
    this.isTargeting = false;       // ターゲティング中か
    this.skillSlot = null;          // どのスキル(Q/W/E)か
    this.indicatorType = null;      // インジケーターの種類
    this.indicatorConfig = null;    // インジケーターの設定(色、サイズなど)
    this.mouseX = 0;                // 現在のマウスX座標(スクリーン座標)
    this.mouseY = 0;                // 現在のマウスY座標(スクリーン座標)

    // クールダウン管理 { skillSlot: { remaining: ms, total: ms } }
    this.cooldowns = {};
  }

  /**
   * ターゲティング開始
   * @param {string} skillSlot - スキルスロット (Q/W/E)
   * @param {string} indicatorType - インジケーター種類 (direction/range/area)
   * @param {object} config - インジケーター設定 { color, range, width など }
   */
  startTargeting(skillSlot, indicatorType = IndicatorType.DIRECTION, config = {}) {
    this.isTargeting = true;
    this.skillSlot = skillSlot;
    this.indicatorType = indicatorType;
    this.indicatorConfig = {
      color: config.color || '#ffffff',
      range: config.range || 300,
      width: config.width || 20,
      ...config
    };
  }

  /**
   * マウス位置を更新
   */
  updateMousePosition(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * ターゲティング終了
   */
  endTargeting() {
    this.isTargeting = false;
    this.skillSlot = null;
    this.indicatorType = null;
    this.indicatorConfig = null;
  }

  /**
   * クールダウン開始
   */
  startCooldown(skillSlot, cooldownMs) {
    this.cooldowns[skillSlot] = {
      remaining: cooldownMs,
      total: cooldownMs
    };
  }

  /**
   * クールダウン更新（毎フレーム呼び出し）
   */
  updateCooldowns(deltaTime) {
    for (const slot in this.cooldowns) {
      this.cooldowns[slot].remaining -= deltaTime;
      if (this.cooldowns[slot].remaining <= 0) {
        delete this.cooldowns[slot];
      }
    }
  }

  /**
   * スキルがクールダウン中か
   */
  isOnCooldown(skillSlot) {
    return !!this.cooldowns[skillSlot];
  }

  /**
   * クールダウン残り時間を取得
   */
  getCooldownRemaining(skillSlot) {
    return this.cooldowns[skillSlot]?.remaining || 0;
  }

  /**
   * クールダウン進捗率を取得 (0~1, 0=終了, 1=開始直後)
   */
  getCooldownRatio(skillSlot) {
    const cd = this.cooldowns[skillSlot];
    if (!cd) return 0;
    return cd.remaining / cd.total;
  }
}
