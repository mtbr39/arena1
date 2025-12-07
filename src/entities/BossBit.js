import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Health } from '../traits/Health.js';
import { Sprite } from '../traits/Sprite.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';
import { AttackTarget } from '../traits/AttackTarget.js';

/**
 * 共通のタワーBitを作成する
 */
function createTowerBit(world, x, y, name, description, color, teamTag, hp, attack) {
  const bit = new Bit(world.generateBitId(), name, description);

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(hp));
  bit.addTrait('Sprite', new Sprite(color, 128, 128, 'rect'));
  bit.addTrait('Collider', new Collider('Circle', { radius: 32 }));
  bit.addTrait('TagSet', new TagSet(['creature', teamTag, 'stationary']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  // MovementTargetは追加しない(動けないように)
  bit.addTrait('AttackTarget', new AttackTarget(300, 1000, attack)); // 攻撃範囲400、クールダウン0.5秒

  return bit;
}

/**
 * Boss Enemy Bit - 動けない強力な敵(ボス)
 */
export function createBossEnemyBit(world, x, y) {
  return createTowerBit(world, x, y, 'Boss', 'A powerful stationary boss', '#ff0000', 'enemy', 300, 20);
}

/**
 * Tower Ally Bit - 動けない強力な味方
 */
export function createTowerAllyBit(world, x, y) {
  return createTowerBit(world, x, y, 'Tower', 'A powerful stationary tower', '#00ff00', 'ally', 300, 20);
}
