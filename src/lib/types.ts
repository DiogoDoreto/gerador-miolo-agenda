export type PageSide = 'left' | 'right';

export interface TableCell {
  kind: 'table-cell';
  style?: 'header' | 'sub-header' | 'normal';
  contents: Content;
}

export interface TableColumn {
  kind: 'table-column';
  colspan?: number;
  contents: (TableCell | TableCell['contents'] | undefined)[];
}

export interface Table {
  kind: 'table';
  columnCount: number;
  rowCount: number;
  columns: (TableColumn | TableColumn['contents'])[];
}

export enum Alignment {
  NW,
  N,
  NE,
  W,
  Center,
  E,
  SW,
  S,
  SE,
}

export interface Textbox {
  kind: 'textbox';
  alignment: Alignment;
  text: string;
}

export type Content = string | Table | Textbox | Content[];

export interface Page {
  side: PageSide;
  contents?: Content;
}

export type RecursivePages = Page | RecursivePages[];

export interface MarginValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Agendamento3x3Config {
  kind: 'agendamento3x3';
  rowsPerTime: number;
  timesheet: string;
}

export type InnerTemplateConfig = Agendamento3x3Config;

export interface Config {
  page: {
    size: [number, number];
    margins: {
      leftPage: MarginValues;
      rightPage: MarginValues;
    };
  };
  colors: {
    table: {
      border: string;
      header: {
        background: string;
        text: string;
      };
      subheader: {
        background: string;
        text: string;
      };
    };
  };
  data: {
    year: number;
    innerTemplateConfig?: InnerTemplateConfig;
  };
}
