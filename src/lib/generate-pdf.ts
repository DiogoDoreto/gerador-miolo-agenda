import { format, getWeekOfMonth } from 'date-fns';
import { daysOfMonth, wholeWeek } from './dates.js';
import { generatePages } from './generate-pages.js';
import { capitalize } from './strings.js';
import {
  Alignment,
  type Area,
  type Calendar,
  type Config,
  type Content,
  type Flex,
  type Page,
  type RecursivePages,
  type Table,
  type TableCell,
  type TableColumn,
} from './types.js';
import { mm_to_points } from './units.js';
import { PdfRenderer } from './renderer/pdf.js';
import type { BaseRenderer } from './renderer/base.js';
import { CanvasRenderer } from './renderer/canvas.js';

function renderPages(pages: RecursivePages) {
  if (Array.isArray(pages)) {
    for (const page of pages) {
      renderPages(page);
    }
  } else {
    renderPage(pages);
  }
}

let renderer: BaseRenderer;
let cfg: Config;

function renderPage(page: Page) {
  renderer.createPage(page);
  const margins = page.side === 'left' ? cfg.page.margins.leftPage : cfg.page.margins.rightPage;
  if (page.contents) {
    const area = renderer.applyMarginToArea(
      {
        x: 0,
        y: 0,
        width: cfg.page.size[0],
        height: cfg.page.size[1],
      },
      margins
    );
    renderContents(area, page.contents);
  }
}

export async function generatePdf(config: Config) {
  cfg = config;
  const pdf = new PdfRenderer(config);
  await pdf.initialize();
  renderer = pdf;
  const pages = generatePages(config);
  try {
    renderPages(pages);
  } catch (err) {
    console.error('Error while rendering pages', pages);
    throw err;
  }
  return pdf.doc?.saveAsBase64({ dataUri: true });
}

export function renderCanvas(context: CanvasRenderingContext2D, config: Config, pages: Page[]) {
  const canvas = new CanvasRenderer(config, context);
  cfg = config;
  renderer = canvas;
  const [pageWidth, pageHeight] = canvas.scale(config.page.size);
  const canvasPaddingX = (context.canvas.width - pageWidth * 2) / 3;
  const canvasPaddingY = (context.canvas.height - pageHeight) / 2;
  if (pages[0]) {
    canvas.setAnchor({ x: canvasPaddingX, y: canvasPaddingY });
    renderPage(pages[0]);
  }
  if (pages[1]) {
    canvas.setAnchor({ x: canvasPaddingX * 2 + pageWidth, y: canvasPaddingY });
    renderPage(pages[1]);
  }
}

function renderContents(area: Area, contents: Content) {
  if (Array.isArray(contents)) {
    for (const c of contents) {
      renderContents(area, c);
    }
    return;
  } else if (typeof contents === 'string') {
    renderer.renderTextbox(area, {
      kind: 'textbox',
      text: contents,
      alignment: Alignment.Center,
    });
  } else
    switch (contents.kind) {
      case 'flex':
        renderFlex(area, contents);
        break;
      case 'textbox':
        renderer.renderTextbox(area, contents);
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

function renderTable(area: Area, contents: Table) {
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
      const style = isTableCell(cell) && cell.style ? cell.style : 'normal';
      const colors =
        style === 'header'
          ? cfg.colors.table.header
          : style === 'sub-header'
            ? cfg.colors.table.subheader
            : undefined;
      renderer.drawRectangle({
        ...cellArea,
        borderWidth: 1,
        borderColor: cfg.colors.table.border,
        backgroundColor: colors ? colors.background : undefined,
      });
      if (cell) {
        renderer.setFontColor(colors ? colors.text : '#000000');
        const cellTextArea = renderer.applyMarginToArea(cellArea, {
          top: 0,
          bottom: 0,
          left: mm_to_points(2),
          right: mm_to_points(2),
        });
        renderContents(cellTextArea, isTableCell(cell) ? cell.contents : cell);
      }
    }
  }
}

function isTableCell(cell?: Content | TableCell): cell is TableCell {
  return !!cell && !Array.isArray(cell) && typeof cell === 'object' && cell.kind === 'table-cell';
}

function renderCalendar(area: Area, c: Calendar) {
  if (c.month) {
    renderCalendarMonth(area, c.year, c.month);
  } else {
    renderCalendarYear(area, c.year);
  }
}

function renderCalendarYear(area: Area, year: number) {
  const makeMonth = (month: number): Calendar => ({ kind: 'calendar', year, month });
  renderFlex(area, {
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
      ].map((months) => ({
        kind: 'flex',
        direction: 'row',
        gap: 10,
        contents: months.map(makeMonth),
      })),
    ],
  });
}

function renderCalendarMonth(area: Area, year: number, month: number) {
  let lastWeek: TableColumn['contents'] = [];
  const rows: Table['columns'] = [
    wholeWeek(cfg.data.locale).map((d) => format(d, 'EEEEE', { locale: cfg.data.locale })),
    lastWeek,
  ];
  let lastWom = 1;
  for (const d of daysOfMonth(year, month - 1)) {
    const wom = getWeekOfMonth(d, { locale: cfg.data.locale });
    if (lastWom !== wom) {
      lastWom = wom;
      lastWeek = [];
      rows.push(lastWeek);
    }
    lastWeek[(7 + d.getDay() - (cfg.data.locale.options?.weekStartsOn ?? 0)) % 7] = d
      .getDate()
      .toString();
  }
  renderFlex(area, {
    kind: 'flex',
    direction: 'column',
    gap: 5,
    contents: [
      {
        kind: 'textbox',
        alignment: Alignment.E,
        fitText: true,
        height: 15,
        text: capitalize(format(new Date(year, month - 1), 'LLLL', { locale: cfg.data.locale })),
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

function renderFlex(area: Area, { direction, contents, gap = 0 }: Flex) {
  const sizeProp = direction === 'column' ? 'height' : 'width';
  const offsetProp = direction === 'column' ? 'y' : 'x';
  const calculateSize = direction === 'column' ? calculateBoxHeight : calculateBoxWidth;
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
    renderContents({ ...area, [sizeProp]: contentSize, [offsetProp]: offsetAcc }, c);
    offsetAcc += contentSize + gap;
  }
}

function calculateBoxWidth(c: Content): number {
  if (Array.isArray(c)) {
    return Math.max(...c.map(calculateBoxWidth));
  }
  if (typeof c !== 'object' || c.kind === 'flex') {
    return 0;
  }
  if ('width' in c && c.width) {
    return c.width;
  }
  if ('contents' in c && c.contents) {
    return calculateBoxWidth(c.contents);
  }
  return 0;
}

function calculateBoxHeight(c: Content): number {
  if (Array.isArray(c)) {
    return Math.max(...c.map(calculateBoxHeight));
  }
  if (typeof c !== 'object' || c.kind === 'flex') {
    return 0;
  }
  if ('height' in c && c.height) {
    return c.height;
  }
  if ('contents' in c && c.contents) {
    return calculateBoxHeight(c.contents);
  }
  return 0;
}
