const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Date-only values represent a user's local calendar date, not a UTC instant. */
export function parseDateOnly(value: string): Date {
  const match = ISO_DATE.exec(value);
  if (!match) throw new Error('Expected a date in YYYY-MM-DD format');

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) {
    throw new Error('Expected a valid calendar date');
  }
  return date;
}

export function todayDateOnly(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateOnly(value: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return new Intl.DateTimeFormat(undefined, options).format(parseDateOnly(value));
}
