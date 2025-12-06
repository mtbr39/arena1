/**
 * System 基底クラス
 *
 * すべての System はこのクラスを継承することで、
 * World による自動登録・自動更新の対象になります。
 */
export class System {
  /**
   * @param {World} world - ゲーム世界
   * @param {Object} options - オプション
   * @param {boolean} options.autoRegister - 自動登録するか(デフォルト: true)
   */
  constructor(world, options = {}) {
    this.world = world;
    this.enabled = true;

    // World が存在し、autoRegister が false でない場合は自動登録
    const autoRegister = options.autoRegister !== false;
    if (world && world.systemManager && autoRegister) {
      world.systemManager.register(this);
    }
  }

  /**
   * 毎フレーム呼ばれる更新処理
   * サブクラスでオーバーライドして実装
   *
   * @param {number} deltaTime - 前フレームからの経過時間(ms)
   */
  update(deltaTime) {
    // サブクラスで実装
  }

  /**
   * System を有効化
   */
  enable() {
    this.enabled = true;
  }

  /**
   * System を無効化
   */
  disable() {
    this.enabled = false;
  }

  /**
   * この System が有効かどうか
   */
  isEnabled() {
    return this.enabled;
  }
}
