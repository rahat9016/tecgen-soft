import { format, isValid, parse } from "date-fns";

// Stays are counted in whole nights, so dates travel as local calendar days ("2026-10-09"),
// never as timestamps — a timestamp can land on a different day on the server than in the browser.
export const toDayKey = (date: Date) => format(date, "yyyy-MM-dd");

export const parseDayKey = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const day = parse(value.slice(0, 10), "yyyy-MM-dd", new Date());
  return isValid(day) ? day : null;
};
