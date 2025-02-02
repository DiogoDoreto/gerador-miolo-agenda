import type { Config, Page } from './types.js';

let ctx: CanvasRenderingContext2D;
let cfg: Config;
let scale = 1;

interface Coordinate {
  x: number;
  y: number;
}

interface Area extends Coordinate {
  width: number;
  height: number;
}

export function renderCanvas(context: CanvasRenderingContext2D, config: Config, pages: Page[]) {
  ctx = context;
  cfg = config;
  calculateScale();

  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();

  const scaledPageSize = cfg.page.size.map((item) => item * scale);
  const canvasPaddingX = (ctx.canvas.width - scaledPageSize[0] * 2) / 3;
  const canvasPaddingY = (ctx.canvas.height - scaledPageSize[1]) / 2;

  if (pages[0]) {
    renderPage(pages[0], { x: canvasPaddingX, y: canvasPaddingY });
  }
  if (pages[1]) {
    renderPage(pages[1], { x: canvasPaddingX * 2 + scaledPageSize[0], y: canvasPaddingY });
  }
}

function calculateScale() {
  const innerContainerWidth = ctx.canvas.width * 0.85;
  const innerContainerHeight = ctx.canvas.height * 0.9;
  const totalPageWidth = cfg.page.size[0] * 2;
  const pageHeight = cfg.page.size[1];

  scale = innerContainerWidth / totalPageWidth;
  const scaledPageHeight = pageHeight * scale;
  if (scaledPageHeight > innerContainerHeight) {
    scale = innerContainerHeight / pageHeight;
  }
}

function renderPage(page: Page, anchor: Coordinate) {
  const pageArea = {
    x: anchor.x,
    y: anchor.y,
    width: cfg.page.size[0] * scale,
    height: cfg.page.size[1] * scale,
  };
  renderPageSheet(pageArea);
}

function renderPageSheet({ x, y, width, height }: Area) {
  ctx.save();
  // draw shadow
  ctx.fillStyle = '#ccc';
  ctx.fillRect(x + 5, y + 5, width, height);
  // draw paper sheet
  ctx.rect(x, y, width, height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();
}
