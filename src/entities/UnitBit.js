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
 * ユニット設定定義
 */
const UNIT_CONFIGS = {
  melee: {
    hp: 60,
    size: 50,
    speed: 0.4,
    attackRange: 80,
    attackCooldown: 1500,
    attackPower: 4,
    tags: []
  },
  ranged: {
    hp: 40,
    size: 40,
    speed: 0.35,
    attackRange: 200,
    attackCooldown: 2000,
    attackPower: 3,
    tags: ['ranged']
  }
};

/**
 * チーム設定定義
 */
const TEAM_CONFIGS = {
  enemy: {
    tag: 'enemy',
    colorMelee: '#ff4444',
    colorRanged: '#ff8844',
    speedMultiplier: 0.75 // 敵は遅く
  },
  ally: {
    tag: 'ally',
    colorMelee: '#44ff88',
    colorRanged: '#88ddff',
    speedMultiplier: 1.0
  }
};

/**
 * 共通のユニットBitを作成する
 */
function createUnitBit(world, x, y, unitType, teamType) {
  const unitConfig = UNIT_CONFIGS[unitType];
  const teamConfig = TEAM_CONFIGS[teamType];

  if (!unitConfig) throw new Error(`Unknown unit type: ${unitType}`);
  if (!teamConfig) throw new Error(`Unknown team type: ${teamType}`);

  const colorKey = `color${unitType.charAt(0).toUpperCase() + unitType.slice(1)}`;
  const color = teamConfig[colorKey];
  const speed = unitConfig.speed * teamConfig.speedMultiplier;

  const name = `${teamType.charAt(0).toUpperCase() + teamType.slice(1)} ${unitType.charAt(0).toUpperCase() + unitType.slice(1)}`;
  const description = `A ${unitType} ${teamType}`;

  const bit = new Bit(world.generateBitId(), name, description);

  bit.addTrait('Position', new Position(x, y, 0, 0));
  bit.addTrait('Health', new Health(unitConfig.hp));
  bit.addTrait('Sprite', new Sprite(color, unitConfig.size, unitConfig.size, 'circle'));
  bit.addTrait('Collider', new Collider('Circle', { radius: unitConfig.size / 2 }));
  bit.addTrait('TagSet', new TagSet(['creature', teamConfig.tag, ...unitConfig.tags]));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, false));
  bit.addTrait('MovementTarget', new MovementTarget(null, null, speed));
  bit.addTrait('AttackTarget', new AttackTarget(
    unitConfig.attackRange,
    unitConfig.attackCooldown,
    unitConfig.attackPower
  ));

  return bit;
}

// Enemy exports
export function createEnemyBit(world, x, y) {
  return createUnitBit(world, x, y, 'melee', 'enemy');
}

export function createEnemyRangedBit(world, x, y) {
  return createUnitBit(world, x, y, 'ranged', 'enemy');
}

// Ally exports
export function createAllyMeleeBit(world, x, y) {
  return createUnitBit(world, x, y, 'melee', 'ally');
}

export function createAllyRangedBit(world, x, y) {
  return createUnitBit(world, x, y, 'ranged', 'ally');
}
