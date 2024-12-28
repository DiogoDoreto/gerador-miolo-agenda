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
  type Config,
  type Content,
  type MarginValues,
  type Page,
  type PageSide,
  type RecursivePages,
  type Table,
  type TableCell,
  type Textbox,
} from './types.js';
import { agendamento3x3 } from './templates/agendamento3x3.js';
import { mm_to_points } from './units.js';

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

function generatePages(config: Config) {
  const { innerTemplateConfig } = config.data;
  if (!innerTemplateConfig) return [];
  if (innerTemplateConfig.kind === 'agendamento3x3') {
    return agendamento3x3(config.data.year, innerTemplateConfig);
  }
  throw new Error('unkown kind: ' + innerTemplateConfig.kind);
}

export async function generatePdf(config: Config) {
  cfg = config;
  lastPageSide = null;
  doc = await PDFDocument.create();
  font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = generatePages(config);
  console.log('pages', pages);
  renderPages(pages);
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
      case 'textbox':
        renderTextbox(area, contents);
        break;
      case 'table':
        renderTable(area, contents);
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
    fontSize: 10,
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
