import type {
  Area,
  BackgroundStyle,
  BorderStyle,
  Config,
  MarginValues,
  Page,
  Textbox,
} from '$lib/types.js';

type YRoot = 'top' | 'bottom';

export abstract class BaseRenderer {
  yRoot: YRoot;
  cfg: Config;
  page!: Page;
  fontColor = '';

  constructor(yRoot: YRoot, config: Config) {
    this.yRoot = yRoot;
    this.cfg = config;
  }

  applyMarginToArea(area: Area, margins: MarginValues): Area {
    const marginY = this.yRoot === 'top' ? margins.top : margins.bottom;
    return {
      x: area.x + margins.left,
      y: area.y + marginY,
      width: area.width - margins.right - margins.left,
      height: area.height - margins.top - margins.bottom,
    };
  }

  createPage(page: Page): void {
    this.page = page;
  }

  setFontColor(color: string) {
    this.fontColor = color;
  }

  abstract renderTextbox(area: Area, contents: Textbox): void;
  abstract drawRectangle(r: Area & Partial<BackgroundStyle> & Partial<BorderStyle>): void;
}
