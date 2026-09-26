'use client';

import Link from 'next/link';
import type { CheckIn } from '@/app/types';
import { formatDateOnly } from '@/lib/domain/date-only';

interface GoalCheckInsProps {
  checkIns: CheckIn[];
  onCheckIn: () => void;
  today: string;
}

function arrayValue(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function firstValue(value: string[] | string | undefined) {
  return arrayValue(value)[0]?.trim();
}

export default function GoalCheckIns({ checkIns, onCheckIn, today }: GoalCheckInsProps) {
  return (
    <section aria-labelledby="goal-check-ins-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="goal-check-ins-heading" className="text-lg font-semibold text-[var(--text-primary)]">Check-ins</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">A short review history for this goal.</p>
        </div>
        <Link href="/checkins" className="app-button-ghost app-button-sm">View all check-ins</Link>
      </div>

      {checkIns.length === 0 ? (
        <div className="app-empty-state mt-4 flex flex-wrap items-center justify-between gap-4 px-5 py-6">
          <div>
            <p className="font-medium text-[var(--text-primary)]">No check-ins yet</p>
            <p className="mt-1 text-sm">Review progress and decide what comes next.</p>
          </div>
          <button type="button" className="app-button-secondary" onClick={onCheckIn}>Check in</button>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-default)]">
          {checkIns.slice(0, 3).map((checkIn) => {
            const accomplishment = firstValue(checkIn.accomplishments);
            const challenge = firstValue(checkIn.challenges);
            const nextFocus = firstValue(checkIn.goals);
            return (
              <article key={checkIn.id} className="py-4">
                <time className="text-sm font-medium text-[var(--text-primary)]" dateTime={checkIn.date}>
                  {formatDateOnly(checkIn.date, { month: 'short', day: 'numeric', year: checkIn.date.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined })}
                </time>
                <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                  {accomplishment ? <p><span className="text-xs text-[var(--text-muted)]">Progress</span><span className="mt-0.5 block line-clamp-2 text-[var(--text-secondary)]">{accomplishment}</span></p> : null}
                  {challenge ? <p><span className="text-xs text-[var(--text-muted)]">Blocked by</span><span className="mt-0.5 block line-clamp-2 text-[var(--text-secondary)]">{challenge}</span></p> : null}
                  {nextFocus ? <p><span className="text-xs text-[var(--text-muted)]">Next</span><span className="mt-0.5 block line-clamp-2 text-[var(--text-secondary)]">{nextFocus}</span></p> : null}
                </div>
                {!accomplishment && !challenge && !nextFocus && checkIn.notes ? <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">{checkIn.notes}</p> : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
