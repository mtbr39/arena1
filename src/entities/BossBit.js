import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Health } from '../traits/Health.js';
import { Sprite } from '../traits/Sprite.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';
import { AttackTarget } from '../traits/AttackTarget.js';
import { Spawner } from '../traits/Spawner.js';
import { createEnemyBit, createEnemyRangedBit, createAllyMeleeBit, createAllyRangedBit } from './UnitBit.js';

/**
 * 共通のタワーBitを作成する
 */
function createTowerBit(world, x, y, name, description, color, teamTag, hp, attack, spawnFactories) {
  const bit = new Bit(world.generateBitId(), name, description);

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(hp));
  bit.addTrait('Sprite', new Sprite(color, 64, 64, 'rect'));
  bit.addTrait('Collider', new Collider('Rect', { width: 64, height: 64 }));
  bit.addTrait('TagSet', new TagSet(['creature', teamTag, 'stationary']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  // MovementTargetは追加しない(動けないように)
  bit.addTrait('AttackTarget', new AttackTarget(300, 400, attack));

  // Spawner Traitを追加 - 10秒ごとに3体をスポーン
  if (spawnFactories && spawnFactories.length > 0) {
    bit.addTrait('Spawner', new Spawner({
      spawnInterval: 10000,
      spawnCount: 3,
      spawnFactories: spawnFactories,
      spawnArea: {
        minX: -100,
        maxX: 100,
        minY: -100,
        maxY: 100
      },
      enabled: true,
      maxSpawnCount: null
    }));
  }

  return bit;
}

/**
 * Boss Enemy Bit - 動けない強力な敵(ボス)
 * Spawner Traitを持ち、定期的に敵ユニット(meleeとranged)を召喚する
 */
export function createBossEnemyBit(world, x, y) {
  return createTowerBit(world, x, y, 'Boss', 'A powerful stationary boss', '#ff0000', 'enemy', 300, 30, [createEnemyBit, createEnemyRangedBit]);
}

/**
 * Tower Ally Bit - 動けない強力な味方
 * Spawner Traitを持ち、定期的に味方ユニット(meleeとranged)を生産する
 */
export function createTowerAllyBit(world, x, y) {
  return createTowerBit(world, x, y, 'Tower', 'A powerful stationary tower', '#00ff00', 'ally', 300, 30, [createAllyMeleeBit, createAllyRangedBit]);
}
