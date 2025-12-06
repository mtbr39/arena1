import { World } from './core/World.js';
import { ActionResolver } from './core/ActionResolver.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { InputSystem } from './systems/InputSystem.js';

// Actions
import { MoveAction } from './actions/MoveAction.js';
import { AttackAction } from './actions/AttackAction.js';
import { ClickAction } from './actions/ClickAction.js';
import { DestroyAction } from './actions/DestroyAction.js';

// Entities
import { createPlayerBit } from './entities/PlayerBit.js';
import { createEnemyBit } from './entities/EnemyBit.js';
import { createUIButtonBit } from './entities/UIButtonBit.js';

/**
 * ゲームのメインクラス
 */
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.world = new World();
    this.resolver = new ActionResolver(this.world);
    this.renderSystem = new RenderSystem(canvas);
    this.inputSystem = new InputSystem(canvas, this.world, this.renderSystem);

    this.lastTime = 0;
    this.running = false;

    this.init();
  }

  /**
   * 初期化
   */
  init() {
    // ActionKindを登録
    this.world.registerActionKind(MoveAction);
    this.world.registerActionKind(AttackAction);
    this.world.registerActionKind(ClickAction);
    this.world.registerActionKind(DestroyAction);

    // プレイヤーを作成
    const player = createPlayerBit(this.world, 400, 300);
    this.world.addBit(player);

    // 敵を複数配置
    for (let i = 0; i < 5; i++) {
      const x = 200 + Math.random() * 400;
      const y = 150 + Math.random() * 300;
      const enemy = createEnemyBit(this.world, x, y);
      this.world.addBit(enemy);
    }

    // UIボタンを作成(攻撃可能!)
    const button1 = createUIButtonBit(
      this.world,
      100,
      50,
      'Spawn Enemy',
      (world) => {
        const x = 300 + Math.random() * 200;
        const y = 200 + Math.random() * 200;
        const enemy = createEnemyBit(world, x, y);
        world.addBit(enemy);
        console.log('Enemy spawned!');
      }
    );
    this.world.addBit(button1);

    const button2 = createUIButtonBit(
      this.world,
      280,
      50,
      'Heal Player',
      (world) => {
        const players = world.queryBits(bit => bit.hasTag('player'));
        if (players.length > 0) {
          const health = players[0].getTrait('Health');
          if (health) {
            health.heal(20);
            console.log('Player healed!');
          }
        }
      }
    );
    this.world.addBit(button2);

    // 説明用のUIテキスト
    const infoButton = createUIButtonBit(
      this.world,
      this.canvas.width - 150,
      50,
      'UI has HP!',
      () => {
        console.log('This UI can be destroyed by attacking it!');
      }
    );
    this.world.addBit(infoButton);

    console.log('Game initialized!');
    console.log('Controls:');
    console.log('- WASD or Arrow keys: Move player');
    console.log('- Left click: Click on entities/UI');
    console.log('- Right click: Attack entities/UI (UIも攻撃できる!)');
  }

  /**
   * 更新
   */
  update(deltaTime) {
    // 入力更新
    this.inputSystem.update();

    // Actionを処理
    this.world.processActions(this.resolver);

    // カメラをプレイヤーに追従(オプション)
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (player) {
      const pos = player.getTrait('Position');
      if (pos) {
        // カメラを中央に配置
        const centerX = pos.x - this.canvas.width / 2;
        const centerY = pos.y - this.canvas.height / 2;
        this.renderSystem.setCamera(centerX, centerY);
      }
    }
  }

  /**
   * 描画
   */
  render() {
    this.renderSystem.render(this.world);
  }

  /**
   * ゲームループ
   */
  gameLoop(timestamp) {
    if (!this.running) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * 開始
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));

    console.log('Game started!');
  }

  /**
   * 停止
   */
  stop() {
    this.running = false;
    console.log('Game stopped!');
  }
}

/**
 * エントリーポイント
 */
export function initGame(canvas) {
  const game = new Game(canvas);
  game.start();
  return game;
}
