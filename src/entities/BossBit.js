import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Health } from '../traits/Health.js';
import { Sprite } from '../traits/Sprite.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';
import { AttackTarget } from '../traits/AttackTarget.js';

/**
 * Boss Enemy Bit - 動けない強力な敵(ボス)
 */
export function createBossEnemyBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'Boss', 'A powerful stationary boss');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(300)); // 高いHP
  bit.addTrait('Sprite', new Sprite('#ff0000', 64, 64, 'rect')); // 大きいサイズ
  bit.addTrait('Collider', new Collider('Circle', { radius: 32 }));
  bit.addTrait('TagSet', new TagSet(['creature', 'enemy', 'stationary']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  // MovementTargetは追加しない(動けないように)
  bit.addTrait('AttackTarget', new AttackTarget(400, 500, 25)); // 攻撃範囲400、クールダウン0.5秒、攻撃力25

  return bit;
}

/**
 * Tower Ally Bit - 動けない強力な味方
 */
export function createTowerAllyBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'Tower', 'A powerful stationary tower');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(250)); // 高いHP
  bit.addTrait('Sprite', new Sprite('#00ff00', 60, 60, 'rect')); // 大きいサイズ
  bit.addTrait('Collider', new Collider('Circle', { radius: 30 }));
  bit.addTrait('TagSet', new TagSet(['creature', 'ally', 'stationary']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  // MovementTargetは追加しない(動けないように)
  bit.addTrait('AttackTarget', new AttackTarget(400, 500, 20)); // 攻撃範囲400、クールダウン0.5秒、攻撃力20

  return bit;
}
