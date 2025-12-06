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

    for (const bit of bits) {
      this.renderBit(bit);
    }
  }

  /**
   * 1つのBitを描画
   */
  renderBit(bit) {
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

    // HPバー描画
    if (health) {
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
