import {
  Alignment,
  type Area,
  type BackgroundStyle,
  type BorderStyle,
  type Config,
  type Coordinate,
  type Page,
  type Textbox,
} from '$lib/types.js';
import { BaseRenderer } from './base.js';

export class CanvasRenderer extends BaseRenderer {
  ctx: CanvasRenderingContext2D;
  #scale = 1;

  constructor(cfg: Config, ctx: CanvasRenderingContext2D) {
    super('top', cfg);
    this.ctx = ctx;
    this.calculateScale();
    this.clearCanvas();
  }

  clearCanvas() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = '#eee';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.restore();
  }

  calculateScale(): void {
    const innerContainerWidth = this.ctx.canvas.width * 0.85;
    const innerContainerHeight = this.ctx.canvas.height * 0.9;
    const totalPageWidth = this.cfg.page.size[0] * 2;
    const pageHeight = this.cfg.page.size[1];

    this.#scale = innerContainerWidth / totalPageWidth;
    const scaledPageHeight = pageHeight * this.#scale;
    if (scaledPageHeight > innerContainerHeight) {
      this.#scale = innerContainerHeight / pageHeight;
    }
  }

  scale(value: number): number;
  scale<T extends number[]>(value: T): T;
  scale<T extends Coordinate>(value: T): T;
  scale<T extends Area>(value: T): T;
  scale<T extends Record<string, number>>(value: T): T;
  scale(
    value: number | number[] | Record<string, number>
  ): number | number[] | Record<string, number> {
    if (Array.isArray(value)) {
      return value.map((num) => this.scale(num));
    }
    if (typeof value === 'object') {
      const scaledEntries = Object.entries(value).map(([k, v]) => [k, this.scale(v)]);
      return Object.fromEntries(scaledEntries);
    }
    return value * this.#scale;
  }

  #anchor: Coordinate = { x: 0, y: 0 };

  setAnchor(anchor: Coordinate): void {
    this.#anchor = anchor;
  }

  anchor<T extends Coordinate>(c: T): T {
    return {
      ...c,
      x: c.x + this.#anchor.x,
      y: c.y + this.#anchor.y,
    };
  }

  createPage(page: Page): void {
    super.createPage(page);
    const [width, height] = this.scale(this.cfg.page.size);
    this.renderPageSheet({ ...this.#anchor, width, height });
  }

  private renderPageSheet({ x, y, width, height }: Area) {
    this.ctx.save();
    this.ctx.beginPath();
    // draw shadow
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillRect(x + 5, y + 5, width, height);
    // draw paper sheet
    this.ctx.rect(x, y, width, height);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.stroke();
    this.ctx.fillStyle = 'white';
    this.ctx.fill();
    this.ctx.restore();
  }

  fitTextToArea(text: string, maxWidth: number, maxHeight: number): void {
    let fontSize = 100; // Start with a large font size
    this.ctx.font = `${fontSize}px Arial`;

    while (true) {
      const metrics = this.ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.2; // Approximate height, adjust as needed

      if ((textWidth <= maxWidth && textHeight <= maxHeight) || fontSize < 10) {
        break;
      }

      fontSize--;
      this.ctx.font = `${fontSize}px Arial`;
    }
  }

  renderTextbox(area: Area, { text, alignment, fitText }: Textbox) {
    const { x, y, width, height } = this.anchor(this.scale(area));
    this.ctx.save();
    if (fitText) {
      this.fitTextToArea(text, width, height);
    }
    const textY = y + height / 2;
    let textX = x;
    switch (alignment) {
      case Alignment.W:
        this.ctx.textAlign = 'left';
        break;
      case Alignment.Center:
        this.ctx.textAlign = 'center';
        textX = x + width / 2;
        break;
      case Alignment.E:
        this.ctx.textAlign = 'right';
        textX = x + width;
        break;
    }
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(text, textX, textY);
    this.ctx.restore();
  }

  drawRectangle({
    borderColor,
    borderWidth,
    backgroundColor,
    ...area
  }: Area & Partial<BackgroundStyle> & Partial<BorderStyle>): void {
    const { x, y, width, height } = this.anchor(this.scale(area));
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fill();
    }

    if (borderColor && borderWidth) {
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderWidth;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
}
