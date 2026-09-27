'use client';

import Link from 'next/link';
import type { CheckIn, Goal } from '@/app/types';
import { formatDateOnly } from '@/lib/domain/date-only';

interface ActivityDayDetailsProps {
  selectedDate?: string;
  today: string;
  checkIns: CheckIn[];
  goalsById: Map<string, Goal>;
  onCheckIn: (date?: string) => void;
}

function firstValue(value: string[] | string | undefined) {
  if (!value) return undefined;
  const values = Array.isArray(value) ? value : (() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  return values.find((item) => typeof item === 'string' && item.trim())?.trim();
}

export default function ActivityDayDetails({ selectedDate, today, checkIns, goalsById, onCheckIn }: ActivityDayDetailsProps) {
  if (!selectedDate) {
    return <p className="text-sm text-[var(--text-muted)]">Select a review day to see its summary.</p>;
  }

  const dateLabel = formatDateOnly(selectedDate, { month: 'short', day: 'numeric', year: 'numeric' });

  if (checkIns.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">No check-in on {dateLabel}.</p>
        {selectedDate <= today ? (
          <button type="button" className="app-button-secondary app-button-sm" onClick={() => onCheckIn(selectedDate)}>
            Check in
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{dateLabel}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {checkIns.length} {checkIns.length === 1 ? 'check-in' : 'check-ins'}
          </p>
        </div>
        <Link href="#recent-check-ins" prefetch={false} className="app-button-ghost app-button-sm">View in history</Link>
      </div>

      <div className="space-y-2">
        {checkIns.map((checkIn) => {
          const progress = firstValue(checkIn.accomplishments);
          const goal = checkIn.goalId ? goalsById.get(checkIn.goalId) : undefined;
          return (
            <div key={checkIn.id} className="border-t border-[var(--border-subtle)] pt-2 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--text-secondary)]">
                <span>{checkIn.mood[0].toUpperCase() + checkIn.mood.slice(1)} mood</span>
                <span>{checkIn.energy[0].toUpperCase() + checkIn.energy.slice(1)} energy</span>
                {goal ? <Link href={`/goals/${goal.id}`} prefetch={false} className="text-[var(--accent)] hover:text-[var(--text-primary)]">{goal.title}</Link> : null}
              </div>
              {progress ? <p className="mt-1 truncate text-[var(--text-primary)]">{progress}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
