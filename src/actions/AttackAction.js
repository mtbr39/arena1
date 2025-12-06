import { ActionKind } from '../core/Action.js';
import { Action } from '../core/Action.js';

/**
 * Attack ActionKind - 攻撃
 */
export const AttackAction = new ActionKind(
  'Attack',
  'Attack',
  (world, action) => {
    const actor = world.getBit(action.actor);
    return actor && actor.active;
  },
  (world, action) => {
    const damage = action.params.damage || 10;

    for (const targetId of action.targets) {
      const target = world.getBit(targetId);
      if (!target) continue;

      const health = target.getTrait('Health');
      if (health) {
        const isDead = health.damage(damage);

        // HPが0になったら削除
        if (isDead) {
          world.enqueueAction(new Action(
            `destroy_${targetId}`,
            'Destroy',
            action.actor,
            [targetId],
            {}
          ));
        }
      }
    }
  }
);
