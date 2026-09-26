'use client';

import { useState } from 'react';
import type { CheckIn, Goal } from '@/app/types';
import { getCheckInActivityWeeks } from '@/lib/domain/checkins';
import ActivityDayDetails from '@/components/app/checkins/ActivityDayDetails';
import ActivityGrid from '@/components/app/checkins/ActivityGrid';
import { formatDateOnly } from '@/lib/domain/date-only';

interface ReviewActivityProps {
  today: string;
  checkInsByDate: Map<string, CheckIn[]>;
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  onCheckIn: (date?: string) => void;
  goalsById: Map<string, Goal>;
  goalFilter: string;
  goalOptions: Goal[];
  onGoalFilterChange: (value: string) => void;
}

export default function ReviewActivity({
  today,
  checkInsByDate,
  selectedDate,
  onSelectDate,
  onCheckIn,
  goalsById,
  goalFilter,
  goalOptions,
  onGoalFilterChange,
}: ReviewActivityProps) {
  const [showFullYear, setShowFullYear] = useState(false);
  const desktopWeeks = getCheckInActivityWeeks(today, 52);
  const mobileWeeks = getCheckInActivityWeeks(today, showFullYear ? 52 : 12);
  const rangeStart = mobileWeeks[0]?.[0] ?? today;
  const rangeLabel = showFullYear ? 'Past year' : 'Last 12 weeks';

  return (
    <section aria-labelledby="review-activity-heading" className="app-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="review-activity-heading" className="text-base font-semibold text-[var(--text-primary)]">Review activity</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">When did you review your progress?</p>
        </div>
        {goalOptions.length > 0 ? (
          <div className="w-full sm:w-56">
            <label htmlFor="check-in-goal-filter" className="sr-only">Filter check-ins by goal</label>
            <select
              id="check-in-goal-filter"
              className="app-select text-sm"
              value={goalFilter}
              onChange={(event) => onGoalFilterChange(event.target.value)}
            >
              <option value="all">All goals</option>
              <option value="standalone">Standalone</option>
              {goalOptions.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
            </select>
          </div>
        ) : null}
      </div>

      <div className="mt-5 hidden md:block">
        <p className="mb-2 text-xs text-[var(--text-muted)]">
          Past year · {formatDateOnly(desktopWeeks[0]?.[0] ?? today, { month: 'short', day: 'numeric', year: 'numeric' })} — {formatDateOnly(today, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <ActivityGrid
          weeks={desktopWeeks}
          today={today}
          checkInsByDate={checkInsByDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          rangeLabel="Past year review activity"
        />
      </div>

      <div className="mt-5 md:hidden">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)]">
            {rangeLabel} · {formatDateOnly(rangeStart, { month: 'short', day: 'numeric' })} — {formatDateOnly(today, { month: 'short', day: 'numeric' })}
          </p>
          <button type="button" className="app-button-ghost app-button-sm" onClick={() => setShowFullYear((value) => !value)}>
            {showFullYear ? 'Show recent 12 weeks' : 'View full year'}
          </button>
        </div>
        <ActivityGrid
          weeks={mobileWeeks}
          today={today}
          checkInsByDate={checkInsByDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          rangeLabel={`${rangeLabel} review activity`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-[3px] border border-[var(--border-subtle)]" aria-hidden="true" />No check-in</span>
        <span className="inline-flex items-center gap-2"><span className="relative h-3 w-3 rounded-[3px] border border-teal-300/35 bg-teal-400/25" aria-hidden="true"><span className="absolute inset-[3px] rounded-full bg-[var(--text-primary)]/70" /></span>Check-in</span>
        <span>Color adds mood context; text carries the meaning.</span>
      </div>

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
        <ActivityDayDetails
          selectedDate={selectedDate}
          today={today}
          checkIns={selectedDate ? checkInsByDate.get(selectedDate) ?? [] : []}
          goalsById={goalsById}
          onCheckIn={onCheckIn}
        />
      </div>
    </section>
  );
}
