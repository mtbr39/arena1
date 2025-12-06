/**
 * InputManager - マウス・キーボードの入力状態を管理
 *
 * ゲーム固有のロジックは含まず、純粋に入力イベントの受付のみを行う
 */
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    // マウス状態
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.mousePressed = false; // フレーム単位のクリック検知
    this.mouseReleased = false;

    // キーボード状態
    this.keys = new Set();
    this.keysPressed = new Set(); // フレーム単位のキー押下検知
    this.keysReleased = new Set();

    this.setupEventListeners();
  }

  setupEventListeners() {
    // マウス移動
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    // マウスクリック
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseDown = true;
      this.mousePressed = true;
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseDown = false;
      this.mouseReleased = true;
    });

    // タッチイベント(スマホ対応)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
      this.mouseDown = true;
      this.mousePressed = true;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.mouseDown = false;
      this.mouseReleased = true;
    });

    // キーボード
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.has(key)) {
        this.keys.add(key);
        this.keysPressed.add(key);
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
      this.keysReleased.add(key);
    });
  }

  /**
   * フレーム終了時に呼ぶ - 単発イベントをリセット
   */
  resetFrameState() {
    this.mousePressed = false;
    this.mouseReleased = false;
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  /**
   * マウス座標を取得
   */
  getMousePosition() {
    return { x: this.mouseX, y: this.mouseY };
  }

  /**
   * マウスが押されているか
   */
  isMouseDown() {
    return this.mouseDown;
  }

  /**
   * マウスが今フレームで押されたか
   */
  wasMousePressed() {
    return this.mousePressed;
  }

  /**
   * マウスが今フレームで離されたか
   */
  wasMouseReleased() {
    return this.mouseReleased;
  }

  /**
   * キーが押されているか
   */
  isKeyDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  /**
   * キーが今フレームで押されたか
   */
  wasKeyPressed(key) {
    return this.keysPressed.has(key.toLowerCase());
  }

  /**
   * キーが今フレームで離されたか
   */
  wasKeyReleased(key) {
    return this.keysReleased.has(key.toLowerCase());
  }
}
