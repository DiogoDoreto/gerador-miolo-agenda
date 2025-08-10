import { daysOfMonth, wholeWeek } from '$lib/dates.js';
import {
  Alignment,
  type Area,
  type Calendar,
  type Config,
  type Content,
  type Flex,
  type Page,
  type Table,
  type TableCell,
} from '$lib/types.js';
import { mm_to_points } from '$lib/units.js';
import { format, getWeekOfMonth } from 'date-fns';
import type { BaseRenderer } from './base.js';
import { CanvasRenderer } from './canvas.js';
import { PdfRenderer } from './pdf.js';
import { capitalize } from '$lib/strings.js';

type TargetRenderer = 'pdf' | 'canvas';

export class DocumentRenderer {
  renderer: BaseRenderer;
  cfg: Config;
  target: TargetRenderer;

  constructor(cfg: Config, target: 'pdf');
  constructor(cfg: Config, target: 'canvas', ctx: CanvasRenderingContext2D);
  constructor(cfg: Config, target: TargetRenderer, ctx?: CanvasRenderingContext2D) {
    this.cfg = cfg;
    this.target = target;

    if (target === 'pdf') {
      const pdf = new PdfRenderer(cfg);
      this.renderer = pdf;
    } else if (target === 'canvas' && ctx) {
      this.renderer = new CanvasRenderer(cfg, ctx);
    } else {
      throw new Error('Wrong parameters');
    }
  }

  renderCanvas(left: Page | undefined, right: Page | undefined) {
    if (!(this.renderer instanceof CanvasRenderer)) {
      throw new Error('Wrong target: ' + this.target);
    }
    const [pageWidth, pageHeight] = this.renderer.scale(this.cfg.page.size);
    const canvasPaddingX = (this.renderer.ctx.canvas.width - pageWidth * 2) / 3;
    const canvasPaddingY = (this.renderer.ctx.canvas.height - pageHeight) / 2;
    if (left) {
      this.renderer.setAnchor({ x: canvasPaddingX, y: canvasPaddingY });
      this.renderPage(left);
    }
    if (right) {
      this.renderer.setAnchor({ x: canvasPaddingX * 2 + pageWidth, y: canvasPaddingY });
      this.renderPage(right);
    }
  }

  async renderPdfDocument(pages: Page[]): Promise<string> {
    if (!(this.renderer instanceof PdfRenderer)) {
      throw new Error('Wrong target: ' + this.target);
    }
    await this.renderer.initialize();
    this.renderPages(pages);
    return this.renderer.doc.saveAsBase64({ dataUri: true });
  }

  renderPages(pages: Page[]) {
    for (const page of pages) {
      this.renderPage(page);
    }
  }

  renderPage(page: Page) {
    this.renderer.createPage(page);
    const margins =
      page.side === 'left' ? this.cfg.page.margins.leftPage : this.cfg.page.margins.rightPage;
    if (page.contents) {
      const area = this.renderer.applyMarginToArea(
        {
          x: 0,
          y: 0,
          width: this.cfg.page.size[0],
          height: this.cfg.page.size[1],
        },
        margins
      );
      this.renderContents(area, page.contents);
    }
  }

  renderContents(area: Area, contents: Content) {
    if (Array.isArray(contents)) {
      for (const c of contents) {
        this.renderContents(area, c);
      }
      return;
    } else if (typeof contents === 'string') {
      this.renderer.renderTextbox(area, {
        kind: 'textbox',
        text: contents,
        alignment: Alignment.Center,
      });
    } else
      switch (contents.kind) {
        case 'flex':
          this.renderFlex(area, contents);
          break;
        case 'textbox':
          this.renderer.renderTextbox(area, contents);
          break;
        case 'table':
          this.renderTable(area, contents);
          break;
        case 'calendar':
          this.renderCalendar(area, contents);
          break;
        default:
          throw new Error(`unknown content: ${JSON.stringify(contents)}`);
      }
  }

  renderFlex(area: Area, { direction, contents, gap = 0 }: Flex) {
    const sizeProp = direction === 'column' ? 'height' : 'width';
    const offsetProp = direction === 'column' ? 'y' : 'x';
    const calculateSize =
      direction === 'column'
        ? this.calculateBoxHeight.bind(this)
        : this.calculateBoxWidth.bind(this);
    const contentSizes = contents.map(calculateSize);
    const totalFixedSize = contentSizes.reduce((sum, size) => sum + size, 0);
    const totalGapSize = gap * (contents.length - 1);
    const totalFlexSize = area[sizeProp] - totalFixedSize - totalGapSize;
    const flexItemsCount = contentSizes.filter((h) => h === 0).length;
    const flexSize = flexItemsCount ? totalFlexSize / flexItemsCount : 0;
    let offsetAcc = area[offsetProp];
    for (let i = 0; i < contents.length; i++) {
      const c = contents[i];
      const contentSize = contentSizes[i] || flexSize;
      this.renderContents({ ...area, [sizeProp]: contentSize, [offsetProp]: offsetAcc }, c);
      offsetAcc += contentSize + gap;
    }
  }

  calculateBoxWidth(c: Content): number {
    if (Array.isArray(c)) {
      return Math.max(...c.map((item) => this.calculateBoxWidth(item)));
    }
    if (typeof c !== 'object' || c.kind === 'flex') {
      return 0;
    }
    if ('width' in c && c.width) {
      return c.width;
    }
    if ('contents' in c && c.contents) {
      return this.calculateBoxWidth(c.contents as Content);
    }
    return 0;
  }

  calculateBoxHeight(c: Content): number {
    if (Array.isArray(c)) {
      return Math.max(...c.map((item) => this.calculateBoxHeight(item)));
    }
    if (typeof c !== 'object' || c.kind === 'flex') {
      return 0;
    }
    if ('height' in c && c.height) {
      return c.height;
    }
    if ('contents' in c && c.contents) {
      return this.calculateBoxHeight(c.contents as Content);
    }
    return 0;
  }

  renderTable(area: Area, contents: Table) {
    const colWidth = area.width / contents.columnCount;
    const rowHeight = area.height / contents.rowCount;
    for (let ncol = 0; ncol < contents.columnCount; ncol++) {
      const col = contents.columns[ncol];
      if (!col) continue;
      const isColDef = !Array.isArray(col)!;
      const colspan = isColDef && col.colspan ? col.colspan : 1;
      const colArea: Area = {
        ...area,
        x: area.x + ncol * colWidth,
        width: colWidth * colspan,
      };
      const colData = isColDef ? col.contents : col;
      for (let row = 0; row < contents.rowCount; row++) {
        const cellArea = {
          ...colArea,
          y: area.y + row * rowHeight,
          height: rowHeight,
        };
        const cell = colData[row];
        const style = this.isTableCell(cell) && cell.style ? cell.style : 'normal';
        const colors =
          style === 'header'
            ? this.cfg.colors.table.header
            : style === 'sub-header'
              ? this.cfg.colors.table.subheader
              : undefined;
        this.renderer.drawRectangle({
          ...cellArea,
          borderWidth: 1,
          borderColor: this.cfg.colors.table.border,
          backgroundColor: colors ? colors.background : undefined,
        });
        if (cell) {
          this.renderer.setFontColor(colors ? colors.text : '#000000');
          const cellTextArea = this.renderer.applyMarginToArea(cellArea, {
            top: 0,
            bottom: 0,
            left: mm_to_points(2),
            right: mm_to_points(2),
          });
          this.renderContents(cellTextArea, this.isTableCell(cell) ? cell.contents : cell);
        }
      }
    }
  }

  isTableCell(cell?: Content | TableCell): cell is TableCell {
    return !!cell && !Array.isArray(cell) && typeof cell === 'object' && cell.kind === 'table-cell';
  }

  renderCalendar(area: Area, c: Calendar) {
    if (c.month) {
      this.renderCalendarMonth(area, c.year, c.month);
    } else {
      this.renderCalendarYear(area, c.year);
    }
  }

  renderCalendarMonth(area: Area, year: number, month: number) {
    let lastWeek: string[] = [];
    const rows: string[][] = [
      wholeWeek(this.cfg.data.locale).map((d) =>
        format(d, 'EEEEE', { locale: this.cfg.data.locale })
      ),
      lastWeek,
    ];
    let lastWom = 1;
    for (const d of daysOfMonth(year, month - 1)) {
      const wom = getWeekOfMonth(d, { locale: this.cfg.data.locale });
      if (lastWom !== wom) {
        lastWom = wom;
        lastWeek = [];
        rows.push(lastWeek);
      }
      lastWeek[(7 + d.getDay() - (this.cfg.data.locale.options?.weekStartsOn ?? 0)) % 7] = d
        .getDate()
        .toString();
    }
    this.renderFlex(area, {
      kind: 'flex',
      direction: 'column',
      gap: 5,
      contents: [
        {
          kind: 'textbox',
          alignment: Alignment.E,
          fitText: true,
          height: 15,
          text: capitalize(
            format(new Date(year, month - 1), 'LLLL', { locale: this.cfg.data.locale })
          ),
        },
        {
          kind: 'table',
          rowCount: rows.length,
          columnCount: 7,
          columns: Array.from({ length: 7 }, (_, idx) => rows.map((row) => row[idx])),
        },
      ],
    });
  }

  renderCalendarYear(area: Area, year: number) {
    const makeMonth = (month: number): Calendar => ({ kind: 'calendar', year, month });
    this.renderFlex(area, {
      kind: 'flex',
      direction: 'column',
      gap: 5,
      contents: [
        {
          kind: 'textbox',
          height: 20,
          alignment: Alignment.E,
          fitText: true,
          text: year.toString(),
        },
        ...[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [10, 11, 12],
        ].map<Flex>((months) => ({
          kind: 'flex',
          direction: 'row',
          gap: 10,
          contents: months.map(makeMonth),
        })),
      ],
    });
  }
}
