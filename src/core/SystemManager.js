/**
 * SystemManager - System の登録と更新を一元管理
 */
export class SystemManager {
  constructor() {
    this.systems = [];
  }

  /**
   * System を登録
   *
   * @param {System} system - 登録する System インスタンス
   */
  register(system) {
    this.systems.push(system);
  }

  /**
   * すべての有効な System の update() を呼ぶ
   *
   * @param {number} deltaTime - 前フレームからの経過時間(ms)
   */
  updateAll(deltaTime) {
    for (const system of this.systems) {
      if (system.isEnabled()) {
        system.update(deltaTime);
      }
    }
  }

  /**
   * 特定の型の System を取得
   *
   * @param {Function} SystemClass - System のクラス
   * @returns {System|null}
   */
  get(SystemClass) {
    return this.systems.find(s => s instanceof SystemClass) || null;
  }

  /**
   * すべての System を取得
   *
   * @returns {System[]}
   */
  getAll() {
    return [...this.systems];
  }

  /**
   * すべての System をクリア
   */
  clear() {
    this.systems = [];
  }
}
