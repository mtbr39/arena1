import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Health } from '../traits/Health.js';
import { Sprite } from '../traits/Sprite.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';
import { MovementTarget } from '../traits/MovementTarget.js';
import { AttackTarget } from '../traits/AttackTarget.js';

/**
 * Ally Bit (Melee) - 味方キャラクター(近距離攻撃)
 */
export function createAllyMeleeBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'AllyMelee', 'A melee ally');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(60));
  bit.addTrait('Sprite', new Sprite('#44ff88', 28, 28, 'rect'));
  bit.addTrait('Collider', new Collider('Circle', { radius: 14 }));
  bit.addTrait('TagSet', new TagSet(['creature', 'ally']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  bit.addTrait('MovementTarget', new MovementTarget(null, null, 0.4)); // 速度0.4
  bit.addTrait('AttackTarget', new AttackTarget(50, 1500, 4)); // 攻撃範囲50、クールダウン1.5秒、攻撃力3.75

  return bit;
}

/**
 * Ally Bit (Ranged) - 味方キャラクター(遠距離攻撃)
 */
export function createAllyRangedBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'AllyRanged', 'A ranged ally');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(40)); // HPは低め
  bit.addTrait('Sprite', new Sprite('#88ddff', 24, 24, 'rect'));
  bit.addTrait('Collider', new Collider('Circle', { radius: 12 }));
  bit.addTrait('TagSet', new TagSet(['creature', 'ally', 'ranged']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  bit.addTrait('MovementTarget', new MovementTarget(null, null, 0.35)); // やや遅い
  bit.addTrait('AttackTarget', new AttackTarget(200, 2000, 3)); // 攻撃範囲200、クールダウン2秒、攻撃力3

  return bit;
}
