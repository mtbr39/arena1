/**
 * RenderSystem - Canvasへの描画を管理
 */
export class RenderSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0, y: 0 };
  }

  /**
   * 全Bitを描画
   */
  render(world) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // クリア
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

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
      ctx.fillStyle = 'rgba(50, 50, 70, 0.9)';
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 2;

      const x = screenX - uiFrame.width / 2;
      const y = screenY - uiFrame.height / 2;

      ctx.fillRect(x, y, uiFrame.width, uiFrame.height);
      ctx.strokeRect(x, y, uiFrame.width, uiFrame.height);

      ctx.restore();
    }

    // Label描画
    if (label) {
      ctx.save();
      ctx.fillStyle = label.color;
      ctx.font = `${label.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.text, screenX, screenY);
      ctx.restore();
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
}
