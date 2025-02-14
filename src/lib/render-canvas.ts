import {
  Alignment,
  type Area,
  type Calendar,
  type Config,
  type Content,
  type Coordinate,
  type Flex,
  type MarginValues,
  type Page,
  type Table,
} from './types.js';

let ctx: CanvasRenderingContext2D;
let cfg: Config;
let scale = 1;

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

  if (page.contents) {
    const margins = cfg.page.margins.leftPage; // FIXME hard-coded left page for now
    const innerArea = applyMarginToArea(pageArea, margins);
    renderContents(innerArea, page.contents);
  }
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

function applyMarginToArea(area: Area, margins: MarginValues): Area {
  return {
    x: area.x + margins.left,
    y: area.y + margins.top,
    width: area.width - margins.right - margins.left,
    height: area.height - margins.bottom - margins.top,
  };
}

function renderContents(area: Area, contents: Content) {
  if (Array.isArray(contents)) {
    for (const c of contents) {
      renderContents(area, c);
    }
    return;
  } else if (typeof contents === 'string') {
    renderTextbox(area, { kind: 'textbox', text: contents, alignment: Alignment.Center });
  } else
    switch (contents.kind) {
      case 'flex':
        renderFlex(area, contents);
        break;
      case 'textbox':
        renderTextbox(area, contents);
        break;
      case 'table':
        renderTable(area, contents);
        break;
      case 'calendar':
        renderCalendar(area, contents);
        break;
      default:
        throw new Error(`unknown content: ${JSON.stringify(contents)}`);
    }
}

function renderTextbox(area: Area, arg1: { kind: string; text: string; alignment: Alignment }) {
  console.log('renderTextbox not implemented.');
}

function renderFlex(area: Area, contents: Flex) {
  console.log('renderFlex not implemented.');
}

function renderTable(area: Area, contents: Table) {
  console.log('renderTable not implemented.');
}

function renderCalendar(area: Area, contents: Calendar) {
  console.log('renderCalendar not implemented.');
}
