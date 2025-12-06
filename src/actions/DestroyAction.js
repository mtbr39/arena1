import { ActionKind } from '../core/Action.js';

/**
 * Destroy ActionKind - 破壊/削除
 */
export const DestroyAction = new ActionKind(
  'Destroy',
  'Destroy',
  (world, action) => {
    return action.targets.length > 0;
  },
  (world, action) => {
    for (const targetId of action.targets) {
      const target = world.getBit(targetId);
      if (target) {
        target.destroy();
        console.log(`Destroyed: ${target.name || target.id}`);
      }
    }
  }
);
