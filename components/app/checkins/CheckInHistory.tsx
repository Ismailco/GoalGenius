'use client';

import type { CheckIn, Goal } from '@/app/types';
import CheckInHistoryItem from '@/components/app/checkins/CheckInHistoryItem';

interface CheckInHistoryProps {
  checkIns: CheckIn[];
  goalsById: Map<string, Goal>;
  today: string;
  allCheckInsExist: boolean;
  onEdit: (checkIn: CheckIn) => void;
  onDelete: (checkIn: CheckIn) => void;
}

export default function CheckInHistory({ checkIns, goalsById, today, allCheckInsExist, onEdit, onDelete }: CheckInHistoryProps) {
  return (
    <section id="recent-check-ins" aria-labelledby="recent-check-ins-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="recent-check-ins-heading" className="text-base font-semibold text-[var(--text-primary)]">Recent check-ins</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Progress, challenges, and what you chose to focus on next.</p>
        </div>
      </div>

      {checkIns.length === 0 && allCheckInsExist ? (
        <div className="surface-empty mt-4 p-6 text-sm text-[var(--text-secondary)]">
          No check-ins for this goal.
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-default)]">
          {checkIns.map((checkIn) => (
            <CheckInHistoryItem
              key={checkIn.id}
              checkIn={checkIn}
              goal={checkIn.goalId ? goalsById.get(checkIn.goalId) : undefined}
              today={today}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
