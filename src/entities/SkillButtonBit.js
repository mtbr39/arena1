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

  // Clickハンドラを登録 - クリックでスキルターゲティング開始（インジケーター設定付き）
  bit.setActionHandler('Click', (world) => {
    const player = world.queryBits(b => b.hasTag('player'))[0];
    if (!player) return;

    const skillTargeting = player.getTrait('SkillTargeting');
    const skillConfig = player.getTrait('SkillConfig');
    if (!skillTargeting || !skillConfig) return;

    // クールダウン中は開始できない
    if (skillTargeting.isOnCooldown(skillSlot)) {
      const remaining = Math.ceil(skillTargeting.getCooldownRemaining(skillSlot) / 1000);
      console.log(`Skill ${skillSlot} is on cooldown (${remaining}s)`);
      return;
    }

    const config = skillConfig.getSkill(skillSlot);
    skillTargeting.startTargeting(
      skillSlot,
      config.indicatorType,
      {
        color: config.color,
        range: config.range,
        width: config.indicatorWidth
      }
    );
    console.log(`Skill ${skillSlot}: Click to target direction`);
  });

  return bit;
}
