import Link from 'next/link';
import { CalendarCheck, Check, ClipboardCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DashboardReviewGoal } from '@/lib/domain/dashboard';
import { formatDateOnly } from '@/lib/domain/date-only';

interface WeeklyReviewProps {
  activeGoalCount: number;
  createGoalAction?: ReactNode;
  onCheckIn: (review: DashboardReviewGoal) => void;
  reviews: DashboardReviewGoal[];
}

export default function WeeklyReview({
  activeGoalCount,
  createGoalAction,
  onCheckIn,
  reviews,
}: WeeklyReviewProps) {
  return (
    <section className="surface-panel p-5 md:p-6" aria-labelledby="weekly-review-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Weekly review</p>
          <h2 id="weekly-review-heading" className="text-lg font-semibold text-[var(--text-primary)]">
            Keep goals current
          </h2>
        </div>
        <ClipboardCheck className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
      </div>

      {activeGoalCount === 0 ? (
        <div className="app-empty-state mt-5 p-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No active goals</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Add a goal to give your weekly review something to track.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {createGoalAction}
            <Link href="/goals" className="app-button-secondary">View goals</Link>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-5">
          <div className="flex items-start gap-3">
            <span className="icon-chip h-9 w-9 shrink-0" aria-hidden="true">
              <Check className="h-4 w-4 text-[var(--success)]" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">You&apos;re up to date</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                Your active goals have recent check-ins.
              </p>
            </div>
          </div>
          <Link href="/checkins" className="app-button-secondary app-button-sm mt-4 inline-flex">
            View check-ins
          </Link>
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex items-start gap-3">
            <span className="icon-chip h-9 w-9 shrink-0 border-[rgba(243,190,109,0.3)] bg-[var(--warning-soft)]" aria-hidden="true">
              <CalendarCheck className="h-4 w-4 text-[var(--warning)]" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {reviews.length} {reviews.length === 1 ? 'goal needs' : 'goals need'} a check-in
              </h3>
              <Link
                href={`/goals/${reviews[0].goal.id}`}
                className="mt-2 block break-words text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)]"
              >
                {reviews[0].goal.title}
              </Link>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {reviews[0].lastCheckIn
                  ? `Last reviewed ${formatDateOnly(reviews[0].lastCheckIn.date, { month: 'short', day: 'numeric' })}`
                  : 'Not reviewed yet'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="app-button app-button-sm" onClick={() => onCheckIn(reviews[0])}>
              Check in
            </button>
            <Link href="/checkins" className="app-button-secondary app-button-sm">
              View check-ins
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
