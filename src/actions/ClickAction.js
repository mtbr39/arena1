import { ActionKind } from '../core/Action.js';

/**
 * Click ActionKind - クリック
 */
export const ClickAction = new ActionKind(
  'Click',
  'Click',
  (world, action) => {
    return true;
  },
  (world, action) => {
    // クリックされたBitに対する処理
    // 主にonActionハンドラで処理される
    for (const targetId of action.targets) {
      const target = world.getBit(targetId);
      if (!target) continue;

      // InputReceiverを持つBitのみ反応
      const inputReceiver = target.getTrait('InputReceiver');
      if (!inputReceiver || !inputReceiver.acceptMouse) {
        continue;
      }

      console.log(`Clicked on: ${target.name || target.id}`);
    }
  }
);
