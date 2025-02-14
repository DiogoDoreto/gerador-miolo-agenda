import {
  Alignment,
  type Area,
  type BackgroundStyle,
  type BorderStyle,
  type Config,
  type Page,
  type PageSide,
  type Textbox,
} from '$lib/types.js';
import {
  layoutSinglelineText,
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  TextAlignment,
} from 'pdf-lib';
import { BaseRenderer } from './base.js';
import { hex_to_rgb } from '$lib/colors.js';

export class PdfRenderer extends BaseRenderer {
  doc!: PDFDocument;
  font!: PDFFont;

  pdfPage!: PDFPage;
  lastPageSide: PageSide | null = null;

  constructor(cfg: Config) {
    super('bottom', cfg);
  }

  async initialize() {
    this.doc = await PDFDocument.create();
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
  }

  createPage(page: Page): void {
    super.createPage(page);
    this.pdfPage = this.doc.addPage(this.cfg.page.size);
    this.lastPageSide = this.lastPageSide === 'left' || !this.lastPageSide ? 'right' : 'left';
    if (this.lastPageSide !== page.side) this.createPage(page);
  }

  renderTextbox(area: Area, contents: Textbox) {
    // TODO N/S alignment
    const layout = layoutSinglelineText(contents.text, {
      alignment:
        contents.alignment === Alignment.W
          ? TextAlignment.Left
          : contents.alignment === Alignment.E
            ? TextAlignment.Right
            : TextAlignment.Center,
      bounds: area,
      font: this.font,
      fontSize: contents.fitText ? undefined : 10,
    });
    this.pdfPage.drawText(contents.text, {
      ...layout.bounds,
      size: layout.fontSize,
      color: this.fontColor ? hex_to_rgb(this.fontColor) : undefined,
    });
  }

  drawRectangle({
    x,
    y,
    width,
    height,
    borderColor,
    borderWidth,
    backgroundColor,
  }: Area & Partial<BackgroundStyle> & Partial<BorderStyle>): void {
    this.pdfPage.drawRectangle({
      x,
      y,
      width,
      height,
      borderWidth,
      borderColor: borderColor ? hex_to_rgb(borderColor) : undefined,
      color: backgroundColor ? hex_to_rgb(backgroundColor) : undefined,
    });
  }
}
