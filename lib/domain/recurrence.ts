import type { TodoRecurrence, TodoReminder } from '@/app/types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string): Date {
  if (!ISO_DATE.test(value)) throw new Error('Expected an ISO date');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error('Expected a valid ISO date');
  return date;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function nextOccurrenceDate(
  occurrenceDate: string,
  recurrence: TodoRecurrence,
): string | null {
  if (recurrence === 'none') return null;
  const date = parseDate(occurrenceDate);

  if (recurrence === 'daily') date.setUTCDate(date.getUTCDate() + 1);
  if (recurrence === 'weekly') date.setUTCDate(date.getUTCDate() + 7);
  if (recurrence === 'monthly') {
    const day = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(day, lastDay));
  }

  return formatDate(date);
}

const reminderMinutes: Record<Exclude<TodoReminder, 'none'>, number> = {
  at_due: 0,
  '15m': 15,
  '1h': 60,
  '1d': 24 * 60,
};

export function reminderDate(
  dueDate: string | null | undefined,
  reminder: TodoReminder,
): Date | null {
  if (!dueDate || reminder === 'none') return null;
  const due = parseDate(dueDate);
  due.setUTCMinutes(due.getUTCMinutes() - reminderMinutes[reminder]);
  return due;
}
