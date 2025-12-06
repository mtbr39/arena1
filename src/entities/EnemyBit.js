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
 * Enemy Bit (Melee) - 敵キャラクター(近距離攻撃)
 */
export function createEnemyBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'Enemy', 'An enemy creature');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(60));
  bit.addTrait('Sprite', new Sprite('#ff4444', 28, 28, 'rect'));
  bit.addTrait('Collider', new Collider('Circle', { radius: 14 }));
  bit.addTrait('TagSet', new TagSet(['creature', 'enemy']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  bit.addTrait('MovementTarget', new MovementTarget(null, null, 0.3)); // 速度0.3で遅く
  bit.addTrait('AttackTarget', new AttackTarget(50, 2000, 4)); // 攻撃範囲50、クールダウン2秒、攻撃力2.5

  return bit;
}

/**
 * Enemy Bit (Ranged) - 敵キャラクター(遠距離攻撃)
 */
export function createEnemyRangedBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'EnemyRanged', 'A ranged enemy');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(40)); // HPは低め
  bit.addTrait('Sprite', new Sprite('#ff8844', 24, 24, 'rect'));
  bit.addTrait('Collider', new Collider('Circle', { radius: 12 }));
  bit.addTrait('TagSet', new TagSet(['creature', 'enemy', 'ranged']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  bit.addTrait('MovementTarget', new MovementTarget(null, null, 0.25)); // やや遅い
  bit.addTrait('AttackTarget', new AttackTarget(200, 2500, 3)); // 攻撃範囲200、クールダウン2.5秒、攻撃力2

  return bit;
}
