import { Bit } from '../core/Bit.js';
import { Position } from '../traits/Position.js';
import { UIFrame } from '../traits/UIFrame.js';
import { Label } from '../traits/Label.js';
import { Collider } from '../traits/Collider.js';
import { TagSet } from '../traits/TagSet.js';
import { InputReceiver } from '../traits/InputReceiver.js';
import { SKILL_PARAM_RANGES, AREA_SKILL_PARAM_RANGES } from '../traits/SkillConfig.js';

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
    const editorPanels = world.queryBits(b => b.hasTag('skill-editor-panel'));
    const isCurrentlyVisible = editorPanels.length > 0 && editorPanels[0].getTrait('UIFrame')?.visible;

    // パネルの表示/非表示をトグル
    for (const panel of editorPanels) {
      const uiFrame = panel.getTrait('UIFrame');
      if (uiFrame) uiFrame.visible = !uiFrame.visible;
    }

    // コントロールの表示/非表示をトグル
    const editorControls = world.queryBits(b => b.hasTag('skill-editor-control'));
    for (const control of editorControls) {
      const uiFrame = control.getTrait('UIFrame');
      if (uiFrame) uiFrame.visible = !uiFrame.visible;
    }

    // 表示された場合、初期化
    if (!isCurrentlyVisible) {
      selectSkillTab(world, 'Q');
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

  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  return bit;
}

/**
 * スキル選択タブ
 */
export function createSkillTabBit(world, x, y, skillSlot) {
  const bit = new Bit(world.generateBitId(), `Skill Tab: ${skillSlot}`, `Tab for ${skillSlot}`);

  const width = 45;
  const height = 28;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(width, height, 160, '#333344', '#666688'));
  bit.addTrait('Label', new Label(`${skillSlot}`, 14, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width, height }));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-tab', `skill-tab-${skillSlot.toLowerCase()}`]));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  bit.skillSlot = skillSlot;

  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  bit.setActionHandler('Click', (world) => {
    selectSkillTab(world, skillSlot);
  });

  return bit;
}

/**
 * スキルタイプ切り替えボタン
 */
export function createSkillTypeToggleBit(world, x, y) {
  const bit = new Bit(world.generateBitId(), 'Skill Type Toggle', 'Toggle between Direction and Area');

  const width = 100;
  const height = 26;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(width, height, 161, '#444466', '#6666aa'));
  bit.addTrait('Label', new Label('Direction', 11, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width, height }));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-type-toggle']));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  bit.setActionHandler('Click', (world) => {
    const player = world.queryBits(b => b.hasTag('player'))[0];
    if (!player) return;

    const skillConfig = player.getTrait('SkillConfig');
    if (!skillConfig) return;

    // 現在選択中のスキルスロットを取得
    const activeSlot = getActiveSkillSlot(world);

    // タイプを切り替え
    skillConfig.toggleSkillType(activeSlot);

    // UIを更新
    updateSkillTypeLabel(world, activeSlot);
    updateParamVisibility(world, activeSlot);
    updateAllParamLabels(world, activeSlot);
  });

  return bit;
}

/**
 * パラメータ調整行（背景）
 */
export function createParamRowBit(world, x, y, paramKey, skillType) {
  const paramConfig = skillType === 'area' ? AREA_SKILL_PARAM_RANGES[paramKey] : SKILL_PARAM_RANGES[paramKey];
  if (!paramConfig) return null;

  const bit = new Bit(world.generateBitId(), `Param Row: ${paramKey}`, `Parameter row for ${paramKey}`);

  const width = 180;
  const height = 26;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(width, height, 155, '#2a2a3a', '#3a3a4a'));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-param-row', `param-${skillType}`, `param-row-${paramKey}`]));

  bit.paramKey = paramKey;
  bit.skillType = skillType;

  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  return bit;
}

/**
 * パラメータ行のラベル（値を表示）
 */
export function createParamLabelBit(world, x, y, paramKey, skillType) {
  const paramConfig = skillType === 'area' ? AREA_SKILL_PARAM_RANGES[paramKey] : SKILL_PARAM_RANGES[paramKey];
  if (!paramConfig) return null;

  const bit = new Bit(world.generateBitId(), `Param Label: ${paramKey}`, `Label for ${paramKey}`);

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(110, 22, 156));
  bit.addTrait('Label', new Label('', 10, '#ffffff'));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-param-label', `param-${skillType}`, `param-label-${paramKey}`]));

  bit.paramKey = paramKey;
  bit.skillType = skillType;

  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  return bit;
}

/**
 * パラメータ調整ボタン（+/-）
 */
export function createParamButtonBit(world, x, y, paramKey, direction, skillType) {
  const paramConfig = skillType === 'area' ? AREA_SKILL_PARAM_RANGES[paramKey] : SKILL_PARAM_RANGES[paramKey];
  if (!paramConfig) return null;

  const bit = new Bit(
    world.generateBitId(),
    `Param Button: ${paramKey} ${direction}`,
    `${direction} button for ${paramKey}`
  );

  const size = 22;

  bit.addTrait('Position', new Position(x, y, 0, 1));
  bit.addTrait('UIFrame', new UIFrame(size, size, 157, '#444455', '#666677'));
  bit.addTrait('Label', new Label(direction === 'increase' ? '+' : '-', 14, '#ffffff'));
  bit.addTrait('Collider', new Collider('Rect', { width: size, height: size }));
  bit.addTrait('TagSet', new TagSet(['ui', 'skill-editor-control', 'skill-param-button', `param-${skillType}`, `param-button-${paramKey}`]));
  bit.addTrait('InputReceiver', new InputReceiver(true, false, true));

  bit.paramKey = paramKey;
  bit.direction = direction;
  bit.skillType = skillType;

  const uiFrame = bit.getTrait('UIFrame');
  uiFrame.visible = false;

  bit.setActionHandler('Click', (world) => {
    const player = world.queryBits(b => b.hasTag('player'))[0];
    if (!player) return;

    const skillConfig = player.getTrait('SkillConfig');
    if (!skillConfig) return;

    const activeSlot = getActiveSkillSlot(world);
    const currentSkill = skillConfig.getSkill(activeSlot);
    const currentValue = currentSkill[paramKey] || 0;
    const { min, max, step } = paramConfig;

    let newValue;
    if (direction === 'increase') {
      newValue = Math.min(max, currentValue + step);
    } else {
      newValue = Math.max(min, currentValue - step);
    }

    // 小数点の精度を補正
    newValue = Math.round(newValue * 100) / 100;

    skillConfig.setSkillParam(activeSlot, paramKey, newValue);
    updateAllParamLabels(world, activeSlot);
  });

  return bit;
}

// ========== ヘルパー関数 ==========

/**
 * 現在選択中のスキルスロットを取得
 */
function getActiveSkillSlot(world) {
  const tabs = world.queryBits(b => b.hasTag('skill-tab'));
  for (const tab of tabs) {
    const uiFrame = tab.getTrait('UIFrame');
    if (uiFrame && uiFrame.backgroundColor === '#555588') {
      return tab.skillSlot;
    }
  }
  return 'Q';
}

/**
 * スキルタブを選択
 */
function selectSkillTab(world, skillSlot) {
  // タブの選択状態を更新
  const allTabs = world.queryBits(b => b.hasTag('skill-tab'));
  for (const tab of allTabs) {
    const tabUiFrame = tab.getTrait('UIFrame');
    if (tabUiFrame) {
      tabUiFrame.backgroundColor = tab.skillSlot === skillSlot ? '#555588' : '#333344';
    }
  }

  // スキルタイプラベルを更新
  updateSkillTypeLabel(world, skillSlot);

  // パラメータ表示を切り替え
  updateParamVisibility(world, skillSlot);

  // ラベルを更新
  updateAllParamLabels(world, skillSlot);
}

/**
 * スキルタイプラベルを更新
 */
function updateSkillTypeLabel(world, skillSlot) {
  const player = world.queryBits(b => b.hasTag('player'))[0];
  if (!player) return;

  const skillConfig = player.getTrait('SkillConfig');
  if (!skillConfig) return;

  const isArea = skillConfig.isAreaSkill(skillSlot);
  const toggleBits = world.queryBits(b => b.hasTag('skill-type-toggle'));

  for (const toggleBit of toggleBits) {
    const label = toggleBit.getTrait('Label');
    if (label) {
      label.text = isArea ? 'Area' : 'Direction';
    }
    const uiFrame = toggleBit.getTrait('UIFrame');
    if (uiFrame) {
      uiFrame.backgroundColor = isArea ? '#664444' : '#444466';
    }
  }
}

/**
 * スキルタイプに応じてパラメータの表示/非表示を切り替え
 */
function updateParamVisibility(world, skillSlot) {
  const player = world.queryBits(b => b.hasTag('player'))[0];
  if (!player) return;

  const skillConfig = player.getTrait('SkillConfig');
  if (!skillConfig) return;

  const isArea = skillConfig.isAreaSkill(skillSlot);

  // エディターが表示中かチェック
  const editorPanels = world.queryBits(b => b.hasTag('skill-editor-panel'));
  const isEditorVisible = editorPanels.length > 0 && editorPanels[0].getTrait('UIFrame')?.visible;

  // 方向スキル用パラメータ（行、ラベル、ボタンすべて）
  const directionParams = world.queryBits(b => b.hasTag('param-direction'));
  for (const param of directionParams) {
    const uiFrame = param.getTrait('UIFrame');
    if (uiFrame) {
      uiFrame.visible = isEditorVisible && !isArea;
    }
  }

  // 範囲スキル用パラメータ（行、ラベル、ボタンすべて）
  const areaParams = world.queryBits(b => b.hasTag('param-area'));
  for (const param of areaParams) {
    const uiFrame = param.getTrait('UIFrame');
    if (uiFrame) {
      uiFrame.visible = isEditorVisible && isArea;
    }
  }

  // 共通パラメータ（cooldown, damage）- これらは両方で表示
  // 今回はdirection/areaそれぞれに含めているので特別な処理は不要
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
  const isArea = skillConfig.isAreaSkill(skillSlot);

  const paramLabels = world.queryBits(b => b.hasTag('skill-param-label'));
  for (const labelBit of paramLabels) {
    const paramKey = labelBit.paramKey;
    const skillType = labelBit.skillType;

    // 現在のスキルタイプに合わないラベルはスキップ
    if ((skillType === 'area') !== isArea) continue;

    const paramConfig = skillType === 'area' ? AREA_SKILL_PARAM_RANGES[paramKey] : SKILL_PARAM_RANGES[paramKey];
    if (!paramConfig) continue;

    const label = labelBit.getTrait('Label');
    if (label) {
      const value = skill[paramKey] || 0;
      let displayValue;
      if (paramKey === 'cooldown') {
        displayValue = `${(value / 1000).toFixed(1)}s`;
      } else if (paramKey === 'speed') {
        displayValue = value.toFixed(1);
      } else {
        displayValue = value;
      }
      label.text = `${paramConfig.label}: ${displayValue}`;
    }
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
  const panelHeight = 250;
  const panelX = baseX;
  const panelY = baseY - panelHeight / 2 - 30;
  const panel = createSkillEditorPanelBit(world, panelX, panelY, panelWidth, panelHeight);
  bits.push(panel);

  // スキル選択タブ (Q, W, E, R)
  const tabY = panelY - panelHeight / 2 + 22;
  const tabStartX = panelX - 75;
  const skillSlots = ['Q', 'W', 'E', 'R'];

  for (let i = 0; i < skillSlots.length; i++) {
    const tab = createSkillTabBit(world, tabStartX + i * 50, tabY, skillSlots[i]);
    bits.push(tab);
  }

  // スキルタイプ切り替えボタン
  const typeToggleY = tabY + 30;
  const typeToggle = createSkillTypeToggleBit(world, panelX, typeToggleY);
  bits.push(typeToggle);

  // 方向スキル用パラメータ
  const directionParams = ['damage', 'range', 'size', 'speed', 'cooldown'];
  const rowStartY = typeToggleY + 28;
  const rowSpacing = 28;

  for (let i = 0; i < directionParams.length; i++) {
    const paramKey = directionParams[i];
    const rowY = rowStartY + i * rowSpacing;

    const row = createParamRowBit(world, panelX, rowY, paramKey, 'direction');
    if (row) bits.push(row);

    const label = createParamLabelBit(world, panelX - 20, rowY, paramKey, 'direction');
    if (label) bits.push(label);

    const minusBtn = createParamButtonBit(world, panelX + 52, rowY, paramKey, 'decrease', 'direction');
    if (minusBtn) bits.push(minusBtn);

    const plusBtn = createParamButtonBit(world, panelX + 78, rowY, paramKey, 'increase', 'direction');
    if (plusBtn) bits.push(plusBtn);
  }

  // 範囲スキル用パラメータ
  const areaParams = ['damage', 'areaRadius', 'castRange', 'cooldown'];

  for (let i = 0; i < areaParams.length; i++) {
    const paramKey = areaParams[i];
    const rowY = rowStartY + i * rowSpacing;

    const row = createParamRowBit(world, panelX, rowY, paramKey, 'area');
    if (row) bits.push(row);

    const label = createParamLabelBit(world, panelX - 20, rowY, paramKey, 'area');
    if (label) bits.push(label);

    const minusBtn = createParamButtonBit(world, panelX + 52, rowY, paramKey, 'decrease', 'area');
    if (minusBtn) bits.push(minusBtn);

    const plusBtn = createParamButtonBit(world, panelX + 78, rowY, paramKey, 'increase', 'area');
    if (plusBtn) bits.push(plusBtn);
  }

  return bits;
}
