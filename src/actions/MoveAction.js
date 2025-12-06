import { ActionKind } from '../core/Action.js';

/**
 * Move ActionKind - 移動
 */
export const MoveAction = new ActionKind(
  'Move',
  'Move',
  (world, action) => {
    const actor = world.getBit(action.actor);
    return actor && actor.hasTrait('Position');
  },
  (world, action) => {
    const actor = world.getBit(action.actor);
    const pos = actor.getTrait('Position');

    if (pos && action.params.x !== undefined && action.params.y !== undefined) {
      pos.x = action.params.x;
      pos.y = action.params.y;
    } else if (pos && action.params.dx !== undefined && action.params.dy !== undefined) {
      pos.x += action.params.dx;
      pos.y += action.params.dy;
    }
  }
);
