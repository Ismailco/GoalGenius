'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CheckIn, Goal } from '@/app/types';
import OverflowMenu from '@/components/app/shared/OverflowMenu';
import { formatDateOnly } from '@/lib/domain/date-only';

interface CheckInHistoryItemProps {
  checkIn: CheckIn;
  goal?: Goal;
  today: string;
  onEdit: (checkIn: CheckIn) => void;
  onDelete: (checkIn: CheckIn) => void;
}

function toArray(value: string[] | string | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function label(value: string) {
  return value[0].toUpperCase() + value.slice(1);
}

function ReflectionField({ title, values, expanded }: { title: string; values: string[]; expanded: boolean }) {
  if (values.length === 0) return null;
  const visibleValues = expanded ? values : values.slice(0, 1);

  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</p>
      <ul className="mt-1 space-y-1 text-sm leading-6 text-[var(--text-secondary)]">
        {visibleValues.map((value, index) => <li key={`${value}-${index}`} className="break-words">{value}</li>)}
      </ul>
    </div>
  );
}

export default function CheckInHistoryItem({ checkIn, goal, today, onEdit, onDelete }: CheckInHistoryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const accomplishments = toArray(checkIn.accomplishments);
  const challenges = toArray(checkIn.challenges);
  const nextFocus = toArray(checkIn.goals);
  const hasMore = accomplishments.length > 1 || challenges.length > 1 || nextFocus.length > 1 || Boolean(checkIn.notes);
  const dateLabel = formatDateOnly(checkIn.date, parseDateOnlyYear(checkIn.date, today) ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <article className="relative py-5 first:pt-1 last:pb-1">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{dateLabel}</h3>
            {goal ? <Link href={`/goals/${goal.id}`} prefetch={false} className="max-w-full truncate text-sm text-[var(--accent)] hover:text-[var(--text-primary)]">{goal.title}</Link> : null}
          </div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {label(checkIn.mood)} mood <span className="px-1 text-[var(--text-muted)]">·</span> {label(checkIn.energy)} energy
          </p>
        </div>

        <OverflowMenu ariaLabel={`Actions for check-in on ${dateLabel}`}>
          <button type="button" role="menuitem" className="block w-full rounded-[var(--radius-control)] px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]" onClick={() => onEdit(checkIn)}>Edit</button>
          <button type="button" role="menuitem" className="block w-full rounded-[var(--radius-control)] px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--bg-surface-hover)]" onClick={() => onDelete(checkIn)}>Delete</button>
        </OverflowMenu>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ReflectionField title="Progress" values={accomplishments} expanded={expanded} />
        <ReflectionField title="Challenges" values={challenges} expanded={expanded} />
        <ReflectionField title="Next" values={nextFocus} expanded={expanded} />
      </div>

      {expanded && checkIn.notes ? (
        <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Notes</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--text-secondary)]">{checkIn.notes}</p>
        </div>
      ) : null}

      {hasMore ? (
        <button type="button" className="app-button-ghost app-button-sm mt-3 -ml-3" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      ) : null}
    </article>
  );
}

function parseCheckInYear(date: string) {
  return date.slice(0, 4);
}

function parseTodayYear(date: string) {
  return date.slice(0, 4);
}

function parseDateOnlyYear(date: string, today: string) {
  return parseCheckInYear(date) === parseTodayYear(today);
}
