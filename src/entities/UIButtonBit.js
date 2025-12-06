import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { Health } from '../traits/Health.js';
import { UIFrame } from '../traits/UIFrame.js';
import { Label } from '../traits/Label.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';

/**
 * UIButton Bit - 攻撃可能なUIボタン
 */
export function createUIButtonBit(world, x, y, text, onClick) {
  const bit = new Bit(world.generateBitId(), `Button: ${text}`, 'A clickable UI button');

  const width = 150;
  const height = 50;

  bit.addTrait('Position', new Position(x, y, 0, 1)); // layer 1 = UI
  bit.addTrait('Health', new Health(30)); // UIも体力を持つ!
  bit.addTrait('UIFrame', new UIFrame(width, height, 100));
  bit.addTrait('Label', new Label(text, 18, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width, height }));
  bit.addTrait('TagSet', new TagSet(['ui', 'button']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  // Clickハンドラを登録
  bit.setActionHandler('Click', (world, action) => {
    console.log(`Button clicked: ${text}`);
    if (onClick) {
      onClick(world, bit);
    }
  });

  // Attackハンドラも登録 - UIを攻撃できる!
  bit.setActionHandler('Attack', (world, action) => {
    console.log(`Button attacked: ${text}`);
    // ダメージ処理は共通のAttackActionで行われる
  });

  return bit;
}
