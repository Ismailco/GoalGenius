import Link from 'next/link';
import { ArrowRight, CalendarDays, Target } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DashboardGoalSummary } from '@/lib/domain/dashboard';
import { formatDateOnly } from '@/lib/domain/date-only';

interface DashboardGoalsProps {
  createGoalAction?: ReactNode;
  goalIdeasAction?: ReactNode;
  goals: DashboardGoalSummary[];
}

export default function DashboardGoals({ createGoalAction, goalIdeasAction, goals }: DashboardGoalsProps) {
  return (
    <section aria-labelledby="today-goals-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="today-goals-heading" className="text-lg font-semibold text-[var(--text-primary)]">Goals</h2>
        <Link href="/goals" className="app-button-ghost app-button-sm">
          View all goals <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="app-empty-state mt-3 p-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No active goals</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Create a goal and turn it into milestones and tasks.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {createGoalAction}
            {goalIdeasAction}
          </div>
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-[var(--radius-container)] border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]">
          {goals.map(({ goal, hasMilestones, nextMilestone, progress }) => (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="group flex flex-col gap-4 border-b border-[var(--border-subtle)] p-4 last:border-b-0 hover:bg-[var(--bg-surface-hover)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="icon-chip mt-0.5 h-9 w-9 shrink-0" aria-hidden="true">
                  <Target className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary-hover)]">
                    {goal.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                    {nextMilestone ? `Next milestone · ${nextMilestone.title}` : hasMilestones ? 'All milestones complete' : 'No milestone yet'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-4 sm:shrink-0">
                {goal.dueDate ? (
                  <span className="hidden items-center gap-1.5 text-xs text-[var(--text-muted)] md:inline-flex">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDateOnly(goal.dueDate, { month: 'short', day: 'numeric' })}
                  </span>
                ) : null}
                <div className="flex min-w-36 flex-1 items-center gap-3 sm:w-40 sm:flex-none">
                  <div
                    className="progress-track flex-1"
                    role="progressbar"
                    aria-label={`${goal.title} progress`}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="w-9 text-right text-xs font-semibold text-[var(--text-secondary)]">{progress}%</span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
