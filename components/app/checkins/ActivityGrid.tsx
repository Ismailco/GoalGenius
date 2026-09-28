'use client';

import { formatDateOnly } from '@/lib/domain/date-only';
import type { CheckIn } from '@/app/types';

const MOOD_CLASSES: Record<CheckIn['mood'], string> = {
  great: 'border-emerald-300/40 bg-emerald-400/30',
  good: 'border-teal-300/35 bg-teal-400/25',
  okay: 'border-slate-300/30 bg-slate-400/20',
  bad: 'border-amber-300/35 bg-amber-400/25',
  terrible: 'border-rose-300/35 bg-rose-400/25',
};

interface ActivityGridProps {
  weeks: string[][];
  today: string;
  checkInsByDate: Map<string, CheckIn[]>;
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  rangeLabel: string;
}

function getDayLabel(date: string, checkIns: CheckIn[], today: string) {
  const readableDate = formatDateOnly(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  if (date > today) return `${readableDate}, future date`;
  if (checkIns.length === 0) return `${readableDate}, no check-in`;

  const moods = [...new Set(checkIns.map((checkIn) => checkIn.mood))].join(', ');
  return `${readableDate}, ${checkIns.length} ${checkIns.length === 1 ? 'check-in' : 'check-ins'}, mood ${moods}`;
}

function getMonthLabel(date: string, previousDate?: string) {
  const current = formatDateOnly(date, { month: 'short' });
  if (!previousDate || formatDateOnly(previousDate, { month: 'short', year: 'numeric' }) !== formatDateOnly(date, { month: 'short', year: 'numeric' })) {
    return current;
  }
  return '';
}

export default function ActivityGrid({
  weeks,
  today,
  checkInsByDate,
  selectedDate,
  onSelectDate,
  rangeLabel,
}: ActivityGridProps) {
  return (
    <div className="overflow-x-auto pb-1" aria-label={rangeLabel}>
      <div className="min-w-max">
        <div className="mb-2 flex gap-1 pl-12 text-[0.65rem] text-[var(--text-muted)]">
          {weeks.map((week, weekIndex) => (
            <div key={week[0]} className="w-5 shrink-0 text-center">
              {getMonthLabel(week[0], weeks[weekIndex - 1]?.[0])}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="grid w-10 shrink-0 grid-rows-7 gap-1 py-0.5 text-[0.65rem] text-[var(--text-muted)]" aria-hidden="true">
            <span className="row-start-1">Sun</span>
            <span className="row-start-3">Tue</span>
            <span className="row-start-5">Thu</span>
          </div>

          <div className="flex gap-1">
            {weeks.map((week) => (
              <div key={week[0]} className="flex w-5 shrink-0 flex-col gap-1">
                {week.map((date) => {
                  const checkIns = checkInsByDate.get(date) ?? [];
                  const isFuture = date > today;
                  const isToday = date === today;
                  const isSelected = selectedDate === date;
                  const moodClass = checkIns[0] ? MOOD_CLASSES[checkIns[0].mood] : 'border-[var(--border-subtle)] bg-transparent';
                  const className = [
                    'relative h-5 w-5 rounded-[4px] border text-[0.55rem] transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                    checkIns.length > 0 ? moodClass : 'border-[var(--border-subtle)] bg-transparent',
                    isToday ? 'ring-1 ring-[var(--brand-primary)] ring-offset-1 ring-offset-[var(--bg-surface)]' : '',
                    isSelected ? 'z-10 ring-2 ring-[var(--text-primary)] ring-offset-1 ring-offset-[var(--bg-surface)]' : '',
                    isFuture ? 'cursor-default opacity-35' : '',
                  ].join(' ');

                  if (isFuture) {
                    return (
                      <span key={date} className={className} aria-label={getDayLabel(date, checkIns, today)}>
                        <span className="sr-only">{getDayLabel(date, checkIns, today)}</span>
                      </span>
                    );
                  }

                  if (checkIns.length === 0) {
                    return (
                      <button
                        key={date}
                        type="button"
                        className={className}
                        aria-label={getDayLabel(date, checkIns, today)}
                        aria-pressed={isSelected}
                        title={getDayLabel(date, checkIns, today)}
                        onClick={() => onSelectDate(date)}
                      >
                        <span className="sr-only">{getDayLabel(date, checkIns, today)}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={date}
                      type="button"
                      className={className}
                      aria-label={getDayLabel(date, checkIns, today)}
                      aria-pressed={isSelected}
                      title={getDayLabel(date, checkIns, today)}
                      onClick={() => onSelectDate(date)}
                    >
                      <span className="absolute inset-[4px] rounded-full bg-[var(--text-primary)]/70" aria-hidden="true" />
                      {checkIns.length > 1 ? <span className="sr-only">Multiple check-ins</span> : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
