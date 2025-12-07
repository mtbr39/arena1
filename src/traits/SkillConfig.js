import { IndicatorType } from './SkillTargeting.js';

/**
 * デフォルトのスキル設定
 * これはカスタマイズ可能な初期値として使用される
 */
export const DEFAULT_SKILL_CONFIG = {
  Q: {
    name: 'Fire',
    color: '#ff6600',
    size: 14,           // 弾の大きさ
    speed: 1,           // 弾の速度
    damage: 25,         // ダメージ
    range: 200,         // 射程
    cooldown: 3000,     // クールダウン(ms)
    indicatorType: IndicatorType.DIRECTION,
    indicatorWidth: 16
  },
  W: {
    name: 'Ice',
    color: '#66ccff',
    size: 16,
    speed: 0.5,
    damage: 30,
    range: 350,
    cooldown: 5000,
    indicatorType: IndicatorType.DIRECTION,
    indicatorWidth: 20
  },
  E: {
    name: 'Wind',
    color: '#99ff66',
    size: 10,
    speed: 2,
    damage: 15,
    range: 100,
    cooldown: 2000,
    indicatorType: IndicatorType.DIRECTION,
    indicatorWidth: 12
  }
};

/**
 * スキルパラメータの範囲定義（エディター用）
 */
export const SKILL_PARAM_RANGES = {
  size: { min: 5, max: 50, step: 1, label: 'Size' },
  speed: { min: 0.1, max: 5, step: 0.1, label: 'Speed' },
  damage: { min: 1, max: 100, step: 1, label: 'Damage' },
  range: { min: 50, max: 500, step: 10, label: 'Range' },
  cooldown: { min: 500, max: 10000, step: 100, label: 'Cooldown (ms)' }
};

/**
 * SkillConfig - プレイヤーごとのカスタマイズ可能なスキル設定を持つTrait
 */
export class SkillConfig {
  constructor(initialConfig = null) {
    // デフォルト設定をディープコピーして初期化
    this.skills = {};
    for (const slot of ['Q', 'W', 'E']) {
      this.skills[slot] = { ...DEFAULT_SKILL_CONFIG[slot] };
    }

    // 初期設定があれば上書き
    if (initialConfig) {
      for (const slot in initialConfig) {
        if (this.skills[slot]) {
          this.skills[slot] = { ...this.skills[slot], ...initialConfig[slot] };
        }
      }
    }
  }

  /**
   * スキル設定を取得
   */
  getSkill(slot) {
    return this.skills[slot] || this.skills.Q;
  }

  /**
   * スキルパラメータを更新
   */
  setSkillParam(slot, param, value) {
    if (this.skills[slot] && param in this.skills[slot]) {
      this.skills[slot][param] = value;
    }
  }

  /**
   * スキル設定を一括更新
   */
  setSkill(slot, config) {
    if (this.skills[slot]) {
      this.skills[slot] = { ...this.skills[slot], ...config };
    }
  }

  /**
   * デフォルトにリセット
   */
  resetToDefault(slot = null) {
    if (slot && this.skills[slot]) {
      this.skills[slot] = { ...DEFAULT_SKILL_CONFIG[slot] };
    } else {
      for (const s of ['Q', 'W', 'E']) {
        this.skills[s] = { ...DEFAULT_SKILL_CONFIG[s] };
      }
    }
  }

  /**
   * JSON形式でエクスポート（保存用）
   */
  toJSON() {
    return JSON.stringify(this.skills);
  }

  /**
   * JSONからインポート（読み込み用）
   */
  fromJSON(json) {
    try {
      const data = JSON.parse(json);
      for (const slot in data) {
        if (this.skills[slot]) {
          this.skills[slot] = { ...DEFAULT_SKILL_CONFIG[slot], ...data[slot] };
        }
      }
    } catch (e) {
      console.error('Failed to import skill config:', e);
    }
  }
}
