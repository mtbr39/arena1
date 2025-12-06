import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Health } from '../traits/Health.js';
import { Sprite } from '../traits/Sprite.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';
import { MovementTarget } from '../traits/MovementTarget.js';

/**
 * Player Bit - プレイヤーキャラクター
 */
export function createPlayerBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'Player', 'The player character');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(100));
  bit.addTrait('Sprite', new Sprite('#4a9eff', 32, 32, 'rect'));
  bit.addTrait('Collider', new Collider('Circle', { radius: 16 }));
  bit.addTrait('TagSet', new TagSet(['creature', 'player']));
  bit.addTrait('InputReceiver', new InputReceiver(true, true, true));
  bit.addTrait('MovementTarget', new MovementTarget());

  return bit;
}
