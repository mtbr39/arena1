import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Sprite } from '../traits/Sprite.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';

/**
 * Projectile Bit - 飛んでいく弾
 */
export function createProjectileBit(world, x, y, dirX, dirY, options = {}) {
  const {
    color = '#ffaa00',
    size = 12,
    speed = 5,
    damage = 20,
    range = 300,
    skillType = 'Q'
  } = options;

  const bit = new Bit(world.generateBitId(), `Projectile`, 'A flying projectile');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Sprite', new Sprite(color, size, size, 'circle'));
  bit.addTrait('Collider', new Collider('Circle', { radius: size / 2 }));
  bit.addTrait('TagSet', new TagSet(['projectile', `skill-${skillType.toLowerCase()}`]));

  // 移動方向と速度
  bit.velocity = { x: dirX * speed, y: dirY * speed };
  bit.damage = damage;
  bit.distanceTraveled = 0;
  bit.maxRange = range;
  bit.ownerId = null; // 発射者のID

  return bit;
}
