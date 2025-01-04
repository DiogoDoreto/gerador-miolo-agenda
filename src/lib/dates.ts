import { addDays, eachDayOfInterval, lastDayOfMonth, nextDay, type Locale } from 'date-fns';

export function daysOfMonth(year: number, month: number) {
  const start = new Date(year, month);
  return eachDayOfInterval({ start, end: lastDayOfMonth(start) });
}

export function wholeWeek(locale: Locale) {
  const start = nextDay(new Date(2025), locale.options?.weekStartsOn ?? 0);
  return eachDayOfInterval({ start, end: addDays(start, 7) });
}
