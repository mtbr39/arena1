import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { UIFrame } from '../traits/UIFrame.js';
import { Label } from '../traits/Label.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';
import { SKILL_PARAM_RANGES } from '../traits/SkillConfig.js';

/**
 * スキルエディターのトグルボタン
 */
export function createSkillEditorToggleBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'Skill Editor Toggle', 'Toggle skill editor visibility');

  const size = 40;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(size, size, 200, '#555555', '#888888'));
  bit.addTrait('Label', new Label('Edit', 12, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width: size, height: size }));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-toggle']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  bit.setActionHandler('Click', (world) => {
    // 現在の表示状態を確認
    const editorPanels = world.queryBits(b => b.hasTag('skill-editor-panel'));
    const isCurrentlyVisible = editorPanels.length > 0 && editorPanels[0].getTrait('UIFrame')?.visible;

    // エディターパネルの表示/非表示をトグル
    for (const panel of editorPanels) {
      const uiFrame = panel.getTrait('UIFrame');
      if (uiFrame) {
        uiFrame.visible = !uiFrame.visible;
      }
    }
    // エディターコントロールの表示/非表示をトグル
    const editorControls = world.queryBits(b => b.hasTag('skill-editor-control'));
    for (const control of editorControls) {
      const uiFrame = control.getTrait('UIFrame');
      if (uiFrame) {
        uiFrame.visible = !uiFrame.visible;
      }
    }

    // 表示された場合、ラベルを初期化
    if (!isCurrentlyVisible) {
      // 最初のタブ(Q)を選択状態に
      const allTabs = world.queryBits(b => b.hasTag('skill-tab'));
      for (const tab of allTabs) {
        const tabUiFrame = tab.getTrait('UIFrame');
        if (tabUiFrame) {
          tabUiFrame.backgroundColor = tab.skillSlot === 'Q' ? '#555588' : '#333344';
        }
      }
      // ラベルを更新
      initializeParamLabels(world, 'Q');
    }
  });

  return bit;
}

/**
 * スキルエディターのパネル（背景）
 */
export function createSkillEditorPanelBit(world, x, y, width, height) {
  const bit = new Bit(world.generateBitId(), 'Skill Editor Panel', 'Skill editor background panel');

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(width, height, 150, '#222233', '#444466'));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-panel']));

  // 初期状態は非表示
  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  return bit;
}

/**
 * スキル選択タブ
 */
export function createSkillTabBit(world, x, y, skillSlot, skillName) {
  const bit = new Bit(world.generateBitId(), `Skill Tab: ${skillSlot}`, `Tab for ${skillSlot}`);

  const width = 60;
  const height = 30;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(width, height, 160, '#333344', '#666688'));
  bit.addTrait('Label', new Label(`${skillSlot}`, 14, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width, height }));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-tab', `skill-tab-${skillSlot.toLowerCase()}`]));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  bit.skillSlot = skillSlot;

  // 初期状態は非表示
  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  bit.setActionHandler('Click', (world) => {
    // すべてのパラメータ行を更新
    const paramRows = world.queryBits(b => b.hasTag('skill-param-row'));
    for (const row of paramRows) {
      row.activeSkillSlot = skillSlot;
      // ラベルを更新
      updateParamRowLabel(world, row);
    }

    // タブの選択状態を更新
    const allTabs = world.queryBits(b => b.hasTag('skill-tab'));
    for (const tab of allTabs) {
      const tabUiFrame = tab.getTrait('UIFrame');
      if (tabUiFrame) {
        tabUiFrame.backgroundColor = tab.skillSlot === skillSlot ? '#555588' : '#333344';
      }
    }
  });

  return bit;
}

/**
 * パラメータ調整行（ラベル + 値 + -/+ ボタン）
 */
export function createParamRowBit(world, x, y, paramKey, initialSkillSlot = 'Q') {
  const paramConfig = SKILL_PARAM_RANGES[paramKey];
  if (!paramConfig) return null;

  const bit = new Bit(world.generateBitId(), `Param Row: ${paramKey}`, `Parameter row for ${paramKey}`);

  const width = 180;
  const height = 28;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(width, height, 155, '#2a2a3a', '#3a3a4a'));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-param-row']));

  bit.paramKey = paramKey;
  bit.activeSkillSlot = initialSkillSlot;

  // 初期状態は非表示
  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  return bit;
}

/**
 * パラメータ行のラベル（値を表示）
 */
export function createParamLabelBit(world, x, y, paramKey, initialSkillSlot = 'Q') {
  const paramConfig = SKILL_PARAM_RANGES[paramKey];
  if (!paramConfig) return null;

  const bit = new Bit(world.generateBitId(), `Param Label: ${paramKey}`, `Label for ${paramKey}`);

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(120, 24, 156));
  bit.addTrait('Label', new Label('', 11, '#ffffff'));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-param-label', `param-label-${paramKey}`]));

  bit.paramKey = paramKey;
  bit.activeSkillSlot = initialSkillSlot;

  // 初期状態は非表示
  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  return bit;
}

/**
 * パラメータ調整ボタン（+/-）
 */
export function createParamButtonBit(world, x, y, paramKey, direction, initialSkillSlot = 'Q') {
  const paramConfig = SKILL_PARAM_RANGES[paramKey];
  if (!paramConfig) return null;

  const bit = new Bit(
    world.generateBitId(),
    `Param Button: ${paramKey} ${direction}`,
    `${direction} button for ${paramKey}`
  );

  const size = 24;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(size, size, 157, '#444455', '#666677'));
  bit.addTrait('Label', new Label(direction === 'increase' ? '+' : '-', 16, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width: size, height: size }));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-param-button', `param-button-${paramKey}`]));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  bit.paramKey = paramKey;
  bit.direction = direction;
  bit.activeSkillSlot = initialSkillSlot;

  // 初期状態は非表示
  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  bit.setActionHandler('Click', (world) => {
    const player = world.queryBits(b => b.hasTag('player'))[0];
    if (!player) return;

    const skillConfig = player.getTrait('SkillConfig');
    if (!skillConfig) return;

    // 現在選択中のスキルスロットを取得
    const paramRows = world.queryBits(b => b.hasTag('skill-param-row'));
    const activeSlot = paramRows.length > 0 ? paramRows[0].activeSkillSlot : 'Q';

    const currentSkill = skillConfig.getSkill(activeSlot);
    const currentValue = currentSkill[paramKey];
    const { min, max, step } = paramConfig;

    let newValue;
    if (direction === 'increase') {
      newValue = Math.min(max, currentValue + step);
    } else {
      newValue = Math.max(min, currentValue - step);
    }

    // 値を更新
    skillConfig.setSkillParam(activeSlot, paramKey, newValue);

    // ラベルを更新
    updateAllParamLabels(world, activeSlot);

    console.log(`Skill ${activeSlot} ${paramKey}: ${currentValue} -> ${newValue}`);
  });

  return bit;
}

/**
 * パラメータ行のラベルを更新
 */
function updateParamRowLabel(world, row) {
  const player = world.queryBits(b => b.hasTag('player'))[0];
  if (!player) return;

  const skillConfig = player.getTrait('SkillConfig');
  if (!skillConfig) return;

  const skillSlot = row.activeSkillSlot;
  updateAllParamLabels(world, skillSlot);
}

/**
 * パラメータラベルを初期化（トグル表示時に呼ばれる）
 */
function initializeParamLabels(world, skillSlot) {
  updateAllParamLabels(world, skillSlot);
}

/**
 * すべてのパラメータラベルを更新
 */
function updateAllParamLabels(world, skillSlot) {
  const player = world.queryBits(b => b.hasTag('player'))[0];
  if (!player) return;

  const skillConfig = player.getTrait('SkillConfig');
  if (!skillConfig) return;

  const skill = skillConfig.getSkill(skillSlot);

  const paramLabels = world.queryBits(b => b.hasTag('skill-param-label'));
  for (const labelBit of paramLabels) {
    const paramKey = labelBit.paramKey;
    const paramConfig = SKILL_PARAM_RANGES[paramKey];
    if (!paramConfig) continue;

    const label = labelBit.getTrait('Label');
    if (label) {
      const value = skill[paramKey];
      const displayValue = paramKey === 'cooldown' ? `${(value / 1000).toFixed(1)}s` : value;
      label.text = `${paramConfig.label}: ${displayValue}`;
    }

    labelBit.activeSkillSlot = skillSlot;
  }

  // ボタンのactiveSkillSlotも更新
  const paramButtons = world.queryBits(b => b.hasTag('skill-param-button'));
  for (const btn of paramButtons) {
    btn.activeSkillSlot = skillSlot;
  }

  // パラメータ行のactiveSkillSlotも更新
  const paramRows = world.queryBits(b => b.hasTag('skill-param-row'));
  for (const row of paramRows) {
    row.activeSkillSlot = skillSlot;
  }
}

/**
 * スキルエディター全体を作成
 */
export function createSkillEditor(world, baseX, baseY) {
  const bits = [];

  // トグルボタン
  const toggle = createSkillEditorToggleBit(world, baseX, baseY);
  bits.push(toggle);

  // パネル（背景）
  const panelWidth = 200;
  const panelHeight = 220;
  const panelX = baseX;
  const panelY = baseY - panelHeight / 2 - 30;
  const panel = createSkillEditorPanelBit(world, panelX, panelY, panelWidth, panelHeight);
  bits.push(panel);

  // スキル選択タブ
  const tabY = panelY - panelHeight / 2 + 25;
  const tabStartX = panelX - 65;
  const skillSlots = ['Q', 'W', 'E'];
  const skillNames = ['Fire', 'Ice', 'Wind'];

  for (let i = 0; i < skillSlots.length; i++) {
    const tab = createSkillTabBit(world, tabStartX + i * 65, tabY, skillSlots[i], skillNames[i]);
    bits.push(tab);
  }

  // パラメータ行
  const params = ['damage', 'range', 'size', 'speed', 'cooldown'];
  const rowStartY = tabY + 35;
  const rowSpacing = 32;

  for (let i = 0; i < params.length; i++) {
    const paramKey = params[i];
    const rowY = rowStartY + i * rowSpacing;

    // 行の背景
    const row = createParamRowBit(world, panelX, rowY, paramKey);
    if (row) bits.push(row);

    // ラベル（パラメータ名と値）
    const label = createParamLabelBit(world, panelX - 15, rowY, paramKey);
    if (label) bits.push(label);

    // -ボタン
    const minusBtn = createParamButtonBit(world, panelX + 55, rowY, paramKey, 'decrease');
    if (minusBtn) bits.push(minusBtn);

    // +ボタン
    const plusBtn = createParamButtonBit(world, panelX + 82, rowY, paramKey, 'increase');
    if (plusBtn) bits.push(plusBtn);
  }

  return bits;
}
