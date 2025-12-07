import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Sprite } from '../traits/Sprite.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';

/**
 * AreaAttack Bit - 範囲攻撃エフェクト
 * 指定位置に出現し、範囲内の敵にダメージを与えて消える
 */
export function createAreaAttackBit(world, x, y, options = {}) {
  const {
    color = '#ff3366',
    radius = 60,
    damage = 50,
    duration = 300,  // エフェクトの持続時間(ms)
    skillType = 'R'
  } = options;

  const bit = new Bit(world.generateBitId(), 'Area Attack', 'An area attack effect');

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Sprite', new Sprite(color, radius * 2, radius * 2, 'circle'));
  bit.addTrait('Collider', new Collider('Circle', { radius }));
  bit.addTrait('TagSet', new TagSet(['area-attack', `skill-${skillType.toLowerCase()}`]));

  // 範囲攻撃のプロパティ
  bit.damage = damage;
  bit.radius = radius;
  bit.duration = duration;
  bit.elapsed = 0;
  bit.ownerId = null;
  bit.hitTargets = new Set();  // 既にダメージを与えた対象

  return bit;
}
