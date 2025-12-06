import { Action } from '../core/Action.js';

/**
 * InputSystem - マウス・キーボード入力を管理
 */
export class InputSystem {
  constructor(canvas, world, renderSystem) {
    this.canvas = canvas;
    this.world = world;
    this.renderSystem = renderSystem;

    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;

    this.keys = new Set();

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
      this.handleClick(e);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseDown = false;
    });

    // タッチイベント(スマホ対応)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const touchEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0  // 左クリック相当
      };
      this.handleClick(touchEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
    });

    // キーボード
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  /**
   * クリック処理
   */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // プレイヤーを探す
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    // レイヤー1(UI)を優先的にチェック
    let targets = this.world.getBitsAtPosition(clickX, clickY, 1);
    let worldPos = null;

    // UIがなければレイヤー0をチェック
    if (targets.length === 0) {
      worldPos = this.renderSystem.screenToWorld(clickX, clickY, 0);
      targets = this.world.getBitsAtPosition(worldPos.x, worldPos.y, 0);
    }

    if (targets.length > 0) {
      // ターゲットがある場合: ClickまたはAttackアクションを発行
      const target = targets[0];

      // 右クリックなら攻撃、左クリックならクリック
      const actionKind = e.button === 2 ? 'Attack' : 'Click';

      const action = new Action(
        `${actionKind.toLowerCase()}_${Date.now()}`,
        actionKind,
        player.id,
        [target.id],
        {
          mouseX: clickX,
          mouseY: clickY,
          damage: 15
        }
      );

      this.world.enqueueAction(action);
    } else {
      // ターゲットがない場合: その場所を目標地点として設定
      if (!worldPos) {
        worldPos = this.renderSystem.screenToWorld(clickX, clickY, 0);
      }

      // MovementTargetに目標地点を設定
      const movementTarget = player.getTrait('MovementTarget');
      if (movementTarget) {
        movementTarget.setTarget(worldPos.x, worldPos.y);
      }
    }
  }

  /**
   * キーボード入力でプレイヤーを移動
   */
  updatePlayerMovement() {
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const speed = 3;
    let dx = 0;
    let dy = 0;

    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= speed;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += speed;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= speed;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += speed;

    if (dx !== 0 || dy !== 0) {
      // キーボード移動中はクリック移動をキャンセル
      const movementTarget = player.getTrait('MovementTarget');
      if (movementTarget) {
        movementTarget.clear();
      }

      const action = new Action(
        `move_${Date.now()}`,
        'Move',
        player.id,
        [],
        { dx, dy }
      );

      this.world.enqueueAction(action);
    }
  }

  /**
   * 更新(毎フレーム呼ぶ)
   */
  update() {
    this.updatePlayerMovement();
  }
}
