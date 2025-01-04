import {
  Alignment,
  type Agendamento3x3Config,
  type Page,
  type PageSide,
  type Table,
  type TableCell,
} from '$lib/types.js';

let timesheetRows: (TableCell | undefined)[];

export function agendamento3x3(year: number, cfg: Agendamento3x3Config) {
  timesheetRows = makeTimesheetRows(cfg);
  return date_list(year).map(generatePagesForMonth);
}

function makeTimesheetRows({ timesheet, rowsPerTime }: Agendamento3x3Config) {
  const subHeader: TableCell = { kind: 'table-cell', style: 'sub-header', contents: '' };
  return timesheet
    .split('\n')
    .map((time) => time.trim())
    .filter(Boolean)
    .flatMap((time) =>
      Array.from({ length: 1 + rowsPerTime, 0: { ...subHeader, contents: time } })
    );
}

function date_list(year: number) {
  const result: Record<number, Date[]> = {};
  for (let i = 0; i < 12; i++) {
    result[i] = [];
  }
  for (
    let d = new Date(Date.UTC(year));
    d.getUTCFullYear() === year;
    d = new Date(d.getTime()), d.setUTCDate(1 + d.getUTCDate())
  ) {
    const dweek = d.getUTCDay();
    if (dweek !== DayWeek.SUNDAY && dweek !== DayWeek.SATURDAY) {
      result[d.getUTCMonth()].push(d);
    }
  }
  return Array.from(Object.values(result));
}

enum DayWeek {
  SUNDAY = 0,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
}

function dweekToSide(date: Date): PageSide {
  switch (date.getUTCDay()) {
    case DayWeek.MONDAY:
    case DayWeek.TUESDAY:
    case DayWeek.WEDNESDAY:
      return 'left';
    case DayWeek.THURSDAY:
    case DayWeek.FRIDAY:
      return 'right';
  }
  throw new Error('Invalid date' + date);
}

function dweekName(date: Date): string {
  switch (date.getUTCDay()) {
    case DayWeek.MONDAY:
      return 'Segunda';
    case DayWeek.TUESDAY:
      return 'Terça';
    case DayWeek.WEDNESDAY:
      return 'Quarta';
    case DayWeek.THURSDAY:
      return 'Quinta';
    case DayWeek.FRIDAY:
      return 'Sexta';
  }
  throw new Error('Invalid date' + date);
}

function makeObsColumn(colspan: number): Table['columns'][0] {
  const cell: TableCell = { kind: 'table-cell', style: 'header', contents: 'Observações' };
  const contents = [cell, ...timesheetRows.map((cell) => cell && { ...cell, contents: '' })];
  if (colspan === 1) return contents;
  return {
    kind: 'table-column',
    colspan,
    contents,
  };
}

function generatePagesForMonth(days: Date[]) {
  const pages: Page[] = [
    {
      side: 'right',
      contents: {
        kind: 'calendar',
        year: days[0].getUTCFullYear(),
        month: days[0].getUTCDate(),
      },
    },
  ];
  let currentPage: Page;
  let currentTable: Table;
  const newPage = (side: PageSide) => {
    currentTable = {
      kind: 'table',
      columnCount: 3,
      rowCount: 1 + timesheetRows.length,
      columns: [],
    };
    currentPage = {
      side,
      contents: currentTable,
    };
    pages.push(currentPage);
  };

  newPage(dweekToSide(days[0]));
  const lastDate = days[days.length - 1];
  for (const date of days) {
    const pageSide = dweekToSide(date);
    if (!currentPage! || !currentTable!) throw new Error('Invalid data'); // 🤮
    if (currentPage.side !== pageSide) newPage(pageSide);
    const day = date.getUTCDay();
    const ncolumn = day - (pageSide === 'left' ? 1 : 4);
    currentTable.columns[ncolumn] = [
      {
        kind: 'table-cell',
        style: 'header',
        contents: [
          { kind: 'textbox', alignment: Alignment.Center, text: dweekName(date) },
          { kind: 'textbox', alignment: Alignment.E, text: date.getUTCDate().toString() },
        ],
      },
      ...timesheetRows,
    ];
    if (day === DayWeek.FRIDAY) {
      currentTable.columns[2] = makeObsColumn(1);
    } else if (date === lastDate) {
      if (day === DayWeek.THURSDAY) {
        currentTable.columns[1] = makeObsColumn(2);
      } else if (pageSide === 'left') {
        newPage('right');
        currentTable.columns[0] = makeObsColumn(3);
      }
    }
  }
  newPage('left');

  return pages;
}
