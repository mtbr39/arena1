import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { UIFrame } from '../traits/UIFrame.js';
import { Label } from '../traits/Label.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';

/**
 * SkillButton Bit - スキルボタン
 */
export function createSkillButtonBit(world, x, y, skillSlot, skillName) {
  const bit = new Bit(world.generateBitId(), `Skill: ${skillSlot}`, `Skill button for ${skillSlot}`);

  const size = 60;

  bit.addTrait('Position', new Position(x, y, 0, 1)); // layer 1 = UI
  bit.addTrait('UIFrame', new UIFrame(size, size, 100, '#333333', '#666666'));
  bit.addTrait('Label', new Label(`${skillSlot}\n${skillName}`, 14, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width: size, height: size }));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-button', `skill-${skillSlot.toLowerCase()}`]));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  // スキルスロットを保存
  bit.skillSlot = skillSlot;

  // Clickハンドラを登録 - クリックでスキルターゲティング開始
  bit.setActionHandler('Click', (world, action) => {
    const player = world.queryBits(b => b.hasTag('player'))[0];
    if (player) {
      const skillTargeting = player.getTrait('SkillTargeting');
      if (skillTargeting) {
        skillTargeting.startTargeting(skillSlot);
        console.log(`Skill ${skillSlot}: Click to target direction`);
      }
    }
  });

  return bit;
}
