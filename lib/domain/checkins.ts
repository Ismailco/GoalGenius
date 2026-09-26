import type { CheckIn } from '../../app/types/index.ts';
import { parseDateOnly } from './date-only.ts';

export type CheckInMood = CheckIn['mood'];
export type CheckInEnergy = CheckIn['energy'];

/** Sorts check-ins by review date with deterministic metadata tie-breakers. */
export function sortCheckInsDescending(checkIns: CheckIn[]): CheckIn[] {
  return checkIns
    .map((checkIn, index) => ({ checkIn, index }))
    .sort((left, right) => {
      const dateDifference = right.checkIn.date.localeCompare(left.checkIn.date);
      if (dateDifference !== 0) return dateDifference;

      const updatedDifference = right.checkIn.updatedAt.localeCompare(left.checkIn.updatedAt);
      if (updatedDifference !== 0) return updatedDifference;

      const createdDifference = right.checkIn.createdAt.localeCompare(left.checkIn.createdAt);
      if (createdDifference !== 0) return createdDifference;

      return left.index - right.index;
    })
    .map(({ checkIn }) => checkIn);
}

/** Groups every check-in by its date without losing same-day entries. */
export function groupCheckInsByDate(checkIns: CheckIn[]): Map<string, CheckIn[]> {
  const grouped = new Map<string, CheckIn[]>();

  for (const checkIn of checkIns) {
    const current = grouped.get(checkIn.date) ?? [];
    current.push(checkIn);
    grouped.set(checkIn.date, current);
  }

  return grouped;
}

/** Returns Sunday-based rolling week columns ending in the current week. */
export function getCheckInActivityWeeks(endDate: string, weekCount: number): string[][] {
  if (!Number.isInteger(weekCount) || weekCount < 1) {
    throw new Error('weekCount must be a positive integer');
  }

  const end = parseDateOnly(endDate);
  const firstWeek = new Date(end);
  firstWeek.setDate(firstWeek.getDate() - (weekCount - 1) * 7 - end.getDay());

  return Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(firstWeek);
      date.setDate(firstWeek.getDate() + weekIndex * 7 + dayIndex);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }),
  );
}

/** Returns the latest dated check-in for a goal, with deterministic tie-breakers. */
export function getLatestGoalCheckIn(goalId: string, checkIns: CheckIn[]): CheckIn | null {
  return sortCheckInsDescending(checkIns.filter((checkIn) => checkIn.goalId === goalId))[0] ?? null;
}
