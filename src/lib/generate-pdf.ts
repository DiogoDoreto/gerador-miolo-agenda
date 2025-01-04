import {
  layoutSinglelineText,
  PDFDocument,
  PDFFont,
  StandardFonts,
  TextAlignment,
  type PDFPage,
} from 'pdf-lib';
import { hex_to_rgb } from './colors.js';
import {
  Alignment,
  type Calendar,
  type Config,
  type Content,
  type Flex,
  type MarginValues,
  type Page,
  type PageSide,
  type RecursivePages,
  type Table,
  type TableCell,
  type TableColumn,
  type Textbox,
} from './types.js';
import { agendamento3x3 } from './templates/agendamento3x3.js';
import { mm_to_points } from './units.js';
import { format, getWeekOfMonth } from 'date-fns';
import { daysOfMonth, wholeWeek } from './dates.js';
import { capitalize } from './strings.js';

let font: PDFFont;

function renderPages(pages: RecursivePages) {
  if (Array.isArray(pages)) {
    for (const page of pages) {
      renderPages(page);
    }
  } else {
    renderPage(pages);
  }
}

let doc: PDFDocument;
let currentPage: PDFPage;
let cfg: Config;

let lastPageSide: PageSide | null = null;

function addPage() {
  currentPage = doc.addPage(cfg.page.size);
  lastPageSide = lastPageSide === 'left' || !lastPageSide ? 'right' : 'left';
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

function applyMarginToArea(area: Area, margins: MarginValues) {
  return {
    x: area.x + margins.left,
    y: area.y + margins.bottom,
    width: area.width - margins.right - margins.left,
    height: area.height - margins.top - margins.bottom,
  };
}

function renderPage(page: Page) {
  addPage();
  if (lastPageSide !== page.side) addPage();
  const margins = lastPageSide === 'left' ? cfg.page.margins.leftPage : cfg.page.margins.rightPage;
  if (page.contents) {
    const area: Area = applyMarginToArea(
      {
        x: 0,
        y: 0,
        width: currentPage.getWidth(),
        height: currentPage.getHeight(),
      },
      margins
    );
    renderContents(area, page.contents);
  }
}

function generatePages(config: Config): RecursivePages {
  const { innerTemplateConfig } = config.data;
  const pages: RecursivePages = [];
  if (config.data.showCalendarPages) {
    pages.push(
      { side: 'left', contents: { kind: 'calendar', year: config.data.year } },
      { side: 'right', contents: { kind: 'calendar', year: 1 + config.data.year } }
    );
  }
  if (!innerTemplateConfig) return pages;
  if (innerTemplateConfig.kind === 'agendamento3x3') {
    pages.push(agendamento3x3(config.data.year, innerTemplateConfig));
  } else {
    throw new Error('unkown kind: ' + innerTemplateConfig.kind);
  }
  return pages;
}

export async function generatePdf(config: Config) {
  cfg = config;
  lastPageSide = null;
  doc = await PDFDocument.create();
  font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = generatePages(config);
  try {
    renderPages(pages);
  } catch (err) {
    console.error('Error while rendering pages', pages);
    throw err;
  }
  return doc.saveAsBase64({ dataUri: true });
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

function renderTextbox(area: Area, contents: Textbox) {
  // TODO alignment
  const layout = layoutSinglelineText(contents.text, {
    alignment:
      contents.alignment === Alignment.W
        ? TextAlignment.Left
        : contents.alignment === Alignment.E
          ? TextAlignment.Right
          : TextAlignment.Center,
    bounds: area,
    font,
    fontSize: contents.fitText ? undefined : 10,
  });
  currentPage.drawText(contents.text, {
    ...layout.bounds,
    size: layout.fontSize,
  });
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
        y: area.y + area.height - rowHeight - row * rowHeight,
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
      currentPage.drawRectangle({
        ...cellArea,
        borderWidth: 1,
        borderColor: hex_to_rgb(cfg.colors.table.border),
        color: colors ? hex_to_rgb(colors.background) : undefined,
      });
      if (cell) {
        currentPage.setFontColor(hex_to_rgb(colors ? colors.text : '#000000'));
        const cellTextArea = applyMarginToArea(cellArea, {
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
  function renderItem(i: number) {
    const c = contents[i];
    const contentSize = contentSizes[i] || flexSize;
    renderContents({ ...area, [sizeProp]: contentSize, [offsetProp]: offsetAcc }, c);
    offsetAcc += contentSize + gap;
  }
  if (direction === 'column') {
    for (let i = contents.length - 1; i >= 0; i--) {
      renderItem(i);
    }
  } else {
    for (let i = 0; i < contents.length; i++) {
      renderItem(i);
    }
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
