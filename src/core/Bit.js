/**
 * Bit - ゲーム世界の全てのエンティティの基底クラス
 */
export class Bit {
  constructor(id, name = '', desc = '') {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.traits = new Map(); // trait名 -> traitインスタンス
    this.onAction = new Map(); // actionKind -> handler関数
    this.active = true; // 削除フラグ
  }

  /**
   * Traitを追加
   */
  addTrait(name, trait) {
    this.traits.set(name, trait);
    return this;
  }

  /**
   * Traitを取得
   */
  getTrait(name) {
    return this.traits.get(name);
  }

  /**
   * Traitを持っているか
   */
  hasTrait(name) {
    return this.traits.has(name);
  }

  /**
   * Actionハンドラを登録
   */
  setActionHandler(actionKind, handler) {
    this.onAction.set(actionKind, handler);
    return this;
  }

  /**
   * Actionハンドラを取得
   */
  getActionHandler(actionKind) {
    return this.onAction.get(actionKind);
  }

  /**
   * タグを持っているか(TagSetトレイト経由)
   */
  hasTag(tag) {
    const tagSet = this.getTrait('TagSet');
    return tagSet && tagSet.tags.includes(tag);
  }

  /**
   * 削除マーク
   */
  destroy() {
    this.active = false;
  }
}
