import { System } from '../core/System.js';
import { IndicatorType } from '../traits/SkillTargeting.js';

/**
 * RenderSystem - Canvasへの描画を管理
 *
 * 注: RenderSystem は特殊で、World への依存がないため
 * System を継承しますが、update() は使わず render(world) を直接呼びます
 */
export class RenderSystem extends System {
  constructor(canvas) {
    super(null, { autoRegister: false }); // 自動登録しない
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0 };
  }

  /**
   * DPR考慮した論理的な幅を取得
   */
  get logicalWidth() {
    const dpr = this.canvas.dpr || 1;
    return this.canvas.width / dpr;
  }

  /**
   * DPR考慮した論理的な高さを取得
   */
  get logicalHeight() {
    const dpr = this.canvas.dpr || 1;
    return this.canvas.height / dpr;
  }

  /**
   * 全Bitを描画
   */
  render(world) {
    const ctx = this.ctx;
    const dpr = this.canvas.dpr || 1;

    // DPR考慮してクリア(物理ピクセル)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 描画スケールを適用
    ctx.save();
    ctx.scale(dpr, dpr);

    // レイヤーとzIndexでソート
    const bits = world.getAllBits().sort((a, b) => {
      const posA = a.getTrait('Position');
      const posB = b.getTrait('Position');
      const layerA = posA ? posA.layer : 0;
      const layerB = posB ? posB.layer : 0;

      if (layerA !== layerB) return layerA - layerB;

      const uiA = a.getTrait('UIFrame');
      const uiB = b.getTrait('UIFrame');
      const zIndexA = uiA ? uiA.zIndex : 0;
      const zIndexB = uiB ? uiB.zIndex : 0;

      return zIndexA - zIndexB;
    });

    // 攻撃範囲を先に描画(最背面)
    for (const bit of bits) {
      this.renderAttackRange(bit);
    }

    // AttackLineを先に描画(Bitの下に表示)
    for (const bit of bits) {
      this.renderAttackLine(bit, world);
    }

    // Bitを描画(HPバー以外)
    for (const bit of bits) {
      this.renderBit(bit, false); // HPバーは描画しない
    }

    // HPバーを最後に描画(最前面)
    for (const bit of bits) {
      this.renderHealthBar(bit);
    }

    // スキルボタンのクールダウン表示
    this.renderSkillCooldowns(world, bits);

    // スキルインジケーターを描画(最前面)
    this.renderSkillIndicator(world);

    // スケールを元に戻す
    ctx.restore();
  }

  /**
   * 1つのBitを描画
   */
  renderBit(bit, includeHealthBar = true) {
    const pos = bit.getTrait('Position');
    if (!pos) return;

    const sprite = bit.getTrait('Sprite');
    const uiFrame = bit.getTrait('UIFrame');
    const label = bit.getTrait('Label');
    const health = bit.getTrait('Health');

    const ctx = this.ctx;

    // カメラオフセット適用(layer 0のみ)
    const offsetX = pos.layer === 0 ? -this.camera.x : 0;
    const offsetY = pos.layer === 0 ? -this.camera.y : 0;

    const screenX = pos.x + offsetX;
    const screenY = pos.y + offsetY;

    // Sprite描画
    if (sprite) {
      ctx.save();
      ctx.fillStyle = sprite.color;

      if (sprite.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(screenX, screenY, sprite.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(
          screenX - sprite.width / 2,
          screenY - sprite.height / 2,
          sprite.width,
          sprite.height
        );
      }

      ctx.restore();
    }

    // UIFrame描画
    if (uiFrame && uiFrame.visible) {
      ctx.save();
      ctx.fillStyle = uiFrame.backgroundColor || 'rgba(50, 50, 70, 0.9)';
      ctx.strokeStyle = uiFrame.borderColor || '#aaaaaa';
      ctx.lineWidth = 2;

      const x = screenX - uiFrame.width / 2;
      const y = screenY - uiFrame.height / 2;

      ctx.fillRect(x, y, uiFrame.width, uiFrame.height);
      ctx.strokeRect(x, y, uiFrame.width, uiFrame.height);

      ctx.restore();
    }

    // Label描画（UIFrameがある場合はvisibleもチェック）
    if (label) {
      const shouldRenderLabel = !uiFrame || uiFrame.visible;
      if (shouldRenderLabel) {
        ctx.save();
        ctx.fillStyle = label.color;
        ctx.font = `${label.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.text, screenX, screenY);
        ctx.restore();
      }
    }

    // HPバーはincludeHealthBarがtrueの場合のみ描画
    if (includeHealthBar && health) {
      const barWidth = sprite ? sprite.width : 40;
      const barHeight = 4;
      const barY = screenY - (sprite ? sprite.height / 2 : 20) - 10;

      ctx.save();
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

      const hpRatio = health.current / health.max;
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(screenX - barWidth / 2, barY, barWidth * hpRatio, barHeight);
      ctx.restore();
    }
  }

  /**
   * HPバーのみを描画
   */
  renderHealthBar(bit) {
    const pos = bit.getTrait('Position');
    if (!pos) return;

    const health = bit.getTrait('Health');
    if (!health) return;

    const sprite = bit.getTrait('Sprite');
    const ctx = this.ctx;

    // カメラオフセット適用(layer 0のみ)
    const offsetX = pos.layer === 0 ? -this.camera.x : 0;
    const offsetY = pos.layer === 0 ? -this.camera.y : 0;

    const screenX = pos.x + offsetX;
    const screenY = pos.y + offsetY;

    const barWidth = sprite ? sprite.width : 40;
    const barHeight = 4;
    const barY = screenY - (sprite ? sprite.height / 2 : 20) - 10;

    ctx.save();
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

    const hpRatio = health.current / health.max;
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(screenX - barWidth / 2, barY, barWidth * hpRatio, barHeight);
    ctx.restore();
  }

  /**
   * 攻撃範囲を描画(固定砲台)
   */
  renderAttackRange(bit) {
    // stationaryタグを持つBitのみ攻撃範囲を表示
    if (!bit.hasTag('stationary')) return;

    const pos = bit.getTrait('Position');
    if (!pos) return;

    const attackTarget = bit.getTrait('AttackTarget');
    if (!attackTarget) return;

    const ctx = this.ctx;

    // カメラオフセット適用(layer 0のみ)
    const offsetX = pos.layer === 0 ? -this.camera.x : 0;
    const offsetY = pos.layer === 0 ? -this.camera.y : 0;

    const screenX = pos.x + offsetX;
    const screenY = pos.y + offsetY;

    // 攻撃範囲を円で描画(陣営によって色を変える)
    const isEnemy = bit.hasTag('enemy');
    const strokeColor = isEnemy ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
    const fillColor = isEnemy ? 'rgba(255, 0, 0, 0.05)' : 'rgba(0, 255, 0, 0.05)';

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenX, screenY, attackTarget.attackRange, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 攻撃線を描画
   */
  renderAttackLine(bit, world) {
    const attackLine = bit.getTrait('AttackLine');
    if (!attackLine) return;

    const pos = bit.getTrait('Position');
    if (!pos) return;

    // ターゲットを取得
    const targetBit = world.getBit(attackLine.targetId);
    if (!targetBit) return;

    const targetPos = targetBit.getTrait('Position');
    if (!targetPos) return;

    const ctx = this.ctx;

    // カメラオフセット適用(layer 0のみ)
    const offsetX = pos.layer === 0 ? -this.camera.x : 0;
    const offsetY = pos.layer === 0 ? -this.camera.y : 0;

    const startX = pos.x + offsetX;
    const startY = pos.y + offsetY;
    const endX = targetPos.x + offsetX;
    const endY = targetPos.y + offsetY;

    // 残り時間に応じて透明度を変更
    const alpha = attackLine.getRemainingRatio();

    ctx.save();
    ctx.strokeStyle = attackLine.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = attackLine.lineWidth;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * カメラ位置を設定
   */
  setCamera(x, y) {
    this.camera.x = x;
    this.camera.y = y;
  }

  /**
   * スクリーン座標からワールド座標へ変換
   */
  screenToWorld(screenX, screenY, layer = 0) {
    if (layer === 0) {
      return {
        x: screenX + this.camera.x,
        y: screenY + this.camera.y
      };
    }
    return { x: screenX, y: screenY };
  }

  /**
   * スキルボタンのクールダウン表示
   */
  renderSkillCooldowns(world, bits) {
    // プレイヤーを探す
    const player = world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const skillTargeting = player.getTrait('SkillTargeting');
    if (!skillTargeting) return;

    const ctx = this.ctx;

    // スキルボタンを探す
    const skillButtons = bits.filter(bit => bit.hasTag('skill-button'));

    for (const button of skillButtons) {
      const skillSlot = button.skillSlot;
      if (!skillSlot) continue;

      const ratio = skillTargeting.getCooldownRatio(skillSlot);
      if (ratio <= 0) continue;

      const pos = button.getTrait('Position');
      const uiFrame = button.getTrait('UIFrame');
      if (!pos || !uiFrame) continue;

      const x = pos.x - uiFrame.width / 2;
      const y = pos.y - uiFrame.height / 2;
      const width = uiFrame.width;
      const height = uiFrame.height;

      ctx.save();

      // クールダウンオーバーレイ（上から下へ減少）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y, width, height * ratio);

      // クールダウン残り時間のテキスト
      const remaining = skillTargeting.getCooldownRemaining(skillSlot);
      const seconds = Math.ceil(remaining / 1000);
      if (seconds > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${seconds}`, pos.x, pos.y);
      }

      ctx.restore();
    }
  }

  /**
   * スキルインジケーターを描画
   */
  renderSkillIndicator(world) {
    // プレイヤーを探す
    const player = world.queryBits(bit => bit.hasTag('player'))[0];
    if (!player) return;

    const skillTargeting = player.getTrait('SkillTargeting');
    if (!skillTargeting || !skillTargeting.isTargeting) return;

    const playerPos = player.getTrait('Position');
    if (!playerPos) return;

    const ctx = this.ctx;

    // カメラオフセット適用
    const offsetX = -this.camera.x;
    const offsetY = -this.camera.y;

    const playerScreenX = playerPos.x + offsetX;
    const playerScreenY = playerPos.y + offsetY;

    const mouseX = skillTargeting.mouseX;
    const mouseY = skillTargeting.mouseY;

    // インジケーターの種類に応じて描画
    switch (skillTargeting.indicatorType) {
      case IndicatorType.DIRECTION:
        this.renderDirectionIndicator(ctx, playerScreenX, playerScreenY, mouseX, mouseY, skillTargeting.indicatorConfig);
        break;
      case IndicatorType.RANGE:
        this.renderRangeIndicator(ctx, mouseX, mouseY, skillTargeting.indicatorConfig);
        break;
      case IndicatorType.AREA:
        this.renderAreaIndicator(ctx, playerScreenX, playerScreenY, mouseX, mouseY, skillTargeting.indicatorConfig);
        break;
    }
  }

  /**
   * 方向指定インジケーター（矢印）を描画
   */
  renderDirectionIndicator(ctx, startX, startY, mouseX, mouseY, config) {
    const dx = mouseX - startX;
    const dy = mouseY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 正規化した方向ベクトル
    const dirX = dx / distance;
    const dirY = dy / distance;

    // インジケーターの長さ（射程と同じ長さ）
    const indicatorLength = config.range;
    const endX = startX + dirX * indicatorLength;
    const endY = startY + dirY * indicatorLength;

    const color = config.color;
    const width = config.width;

    ctx.save();

    // メインの矢印線（幅を持った長方形で表現）
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 矢印の先端
    const arrowSize = width * 1.5;
    const arrowAngle = Math.atan2(dirY, dirX);

    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
      endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
      endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    // 外枠（輪郭線）
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 範囲指定インジケーター（円）を描画
   */
  renderRangeIndicator(ctx, centerX, centerY, config) {
    const color = config.color;
    const radius = config.range;

    ctx.save();

    // 塗りつぶし
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 外枠
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * エリア指定インジケーター（長方形）を描画
   */
  renderAreaIndicator(ctx, startX, startY, mouseX, mouseY, config) {
    const dx = mouseX - startX;
    const dy = mouseY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const dirX = dx / distance;
    const dirY = dy / distance;

    const length = Math.min(config.range, distance);
    const width = config.width;
    const color = config.color;

    // 長方形の四隅を計算
    const perpX = -dirY;
    const perpY = dirX;
    const halfWidth = width / 2;

    const corners = [
      { x: startX + perpX * halfWidth, y: startY + perpY * halfWidth },
      { x: startX - perpX * halfWidth, y: startY - perpY * halfWidth },
      { x: startX + dirX * length - perpX * halfWidth, y: startY + dirY * length - perpY * halfWidth },
      { x: startX + dirX * length + perpX * halfWidth, y: startY + dirY * length + perpY * halfWidth }
    ];

    ctx.save();

    // 塗りつぶし
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.fill();

    // 外枠
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}
