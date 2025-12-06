import { World } from './core/World.js';
import { ActionResolver } from './core/ActionResolver.js';
import { RenderSystem } from './systems/RenderSystem.js';
import { InputSystem } from './systems/InputSystem.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { ProjectileSystem } from './systems/ProjectileSystem.js';
import { CombatAISystem } from './systems/CombatAISystem.js';
import { SpawnSystem } from './systems/SpawnSystem.js';
import { RepulsionSystem } from './systems/RepulsionSystem.js';

// Actions
import { MoveAction } from './actions/MoveAction.js';
import { AttackAction } from './actions/AttackAction.js';
import { ClickAction } from './actions/ClickAction.js';
import { DestroyAction } from './actions/DestroyAction.js';

// Entities
import { createPlayerBit } from './entities/PlayerBit.js';
import { createEnemyBit, createEnemyRangedBit } from './entities/EnemyBit.js';
import { createAllyMeleeBit, createAllyRangedBit } from './entities/AllyBit.js';
import { createBossEnemyBit, createTowerAllyBit } from './entities/BossBit.js';
import { createUIButtonBit } from './entities/UIButtonBit.js';
import { createSkillButtonBit } from './entities/SkillButtonBit.js';

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
    this.movementSystem = new MovementSystem(this.world);
    this.combatSystem = new CombatSystem(this.world);
    this.projectileSystem = new ProjectileSystem(this.world);
    this.combatAISystem = new CombatAISystem(this.world);
    this.repulsionSystem = new RepulsionSystem(this.world);
    this.spawnSystem = new SpawnSystem(this.world, {
      enemySpawnInterval: 8000, // 8秒ごとに敵をスポーン
      allySpawnInterval: 10000, // 10秒ごとに味方をスポーン
      enemySpawnCount: 3, // 一度に3匹の敵をスポーン
      allySpawnCount: 2, // 一度に2匹の味方をスポーン
      enemyFactories: [createEnemyBit, createEnemyRangedBit],
      allyFactories: [createAllyMeleeBit, createAllyRangedBit],
      enemySpawnArea: { minX: 100, maxX: 700, minY: -400, maxY: -200 },
      allySpawnArea: { minX: 200, maxX: 600, minY: 800, maxY: 1000 }
    });

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

    // ボス敵を配置(画面上部中央、動かない)
    const boss = createBossEnemyBit(this.world, 400, -100);
    this.world.addBit(boss);

    // タワー味方を配置(画面下部中央、動かない)
    const tower = createTowerAllyBit(this.world, 400, 700);
    this.world.addBit(tower);

    // 敵を複数配置(近距離と遠距離)
    for (let i = 0; i < 3; i++) {
      const x = 200 + Math.random() * 400;
      const y = 150 + Math.random() * 300;
      const enemy = createEnemyBit(this.world, x, y);
      this.world.addBit(enemy);
    }

    // 遠距離敵を配置
    for (let i = 0; i < 2; i++) {
      const x = 200 + Math.random() * 400;
      const y = 150 + Math.random() * 300;
      const rangedEnemy = createEnemyRangedBit(this.world, x, y);
      this.world.addBit(rangedEnemy);
    }

    // 味方を配置(近距離と遠距離)
    for (let i = 0; i < 2; i++) {
      const x = 300 + Math.random() * 200;
      const y = 250 + Math.random() * 200;
      const allyMelee = createAllyMeleeBit(this.world, x, y);
      this.world.addBit(allyMelee);
    }

    // 遠距離味方を配置
    for (let i = 0; i < 2; i++) {
      const x = 300 + Math.random() * 200;
      const y = 250 + Math.random() * 200;
      const allyRanged = createAllyRangedBit(this.world, x, y);
      this.world.addBit(allyRanged);
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

    // スキルボタンを画面下部に配置
    const skillButtonY = this.renderSystem.logicalHeight - 80;
    const skillButtonStartX = this.renderSystem.logicalWidth / 2 - 100;

    const skillQ = createSkillButtonBit(this.world, skillButtonStartX, skillButtonY, 'Q', 'Fire');
    this.world.addBit(skillQ);

    const skillW = createSkillButtonBit(this.world, skillButtonStartX + 70, skillButtonY, 'W', 'Ice');
    this.world.addBit(skillW);

    const skillE = createSkillButtonBit(this.world, skillButtonStartX + 140, skillButtonY, 'E', 'Wind');
    this.world.addBit(skillE);

    console.log('Game initialized!');
    console.log('Controls:');
    console.log('- Click empty area: Move to that position');
    console.log('- Click enemy: Move close and attack');
    console.log('- Q/W/E keys or skill buttons: Activate skill, then click to aim');
  }

  /**
   * 更新
   */
  update(deltaTime) {
    // 入力更新
    this.inputSystem.update();

    // スポーンシステム更新
    this.spawnSystem.update();

    // AI更新(すべてのcreatureが自動で敵を探す)
    this.combatAISystem.update();

    // 移動システム更新
    this.movementSystem.update();

    // 斥力システム更新(ユニットが重ならないように)
    this.repulsionSystem.update();

    // 戦闘システム更新
    this.combatSystem.update();

    // 弾システム更新
    this.projectileSystem.update();

    // Actionを処理
    this.world.processActions(this.resolver);

    // カメラをプレイヤーに追従(オプション)
    const player = this.world.queryBits(bit => bit.hasTag('player'))[0];
    if (player) {
      const pos = player.getTrait('Position');
      if (pos) {
        // カメラを中央に配置
        const centerX = pos.x - this.renderSystem.logicalWidth / 2;
        const centerY = pos.y - this.renderSystem.logicalHeight / 2;
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
