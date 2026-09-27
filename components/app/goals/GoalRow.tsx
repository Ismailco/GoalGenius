import Link from 'next/link';
import { CalendarDays, Check, ChevronRight, Target } from 'lucide-react';
import type { Goal, Milestone } from '@/app/types';
import { formatDateOnly } from '@/lib/domain/date-only';
import GoalActionsMenu from '@/components/app/goals/GoalActionsMenu';

export interface GoalOverviewModel {
  goal: Goal;
  hasMilestones: boolean;
  nextMilestone: Milestone | null;
  progress: number;
}

interface GoalRowProps {
  model: GoalOverviewModel;
  today: string;
  onDelete: (goal: Goal) => void;
  onUpdated?: () => void | Promise<void>;
}

function labelForCategory(category: Goal['category']): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function GoalRow({ model, today, onDelete, onUpdated }: GoalRowProps) {
  const { goal, hasMilestones, nextMilestone, progress } = model;
  const isCompleted = goal.status === 'completed';
  const isOverdue = !isCompleted && Boolean(goal.dueDate && goal.dueDate < today);
  const milestoneLabel = nextMilestone
    ? nextMilestone.title
    : hasMilestones
      ? 'All milestones complete'
      : 'No milestone yet';

  return (
    <article className="group border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-surface-hover)]">
      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:grid-cols-[minmax(17rem,1.65fr)_minmax(13rem,1.2fr)_minmax(6rem,.7fr)_minmax(10rem,1fr)_auto] xl:items-center">
        <div className="col-start-1 row-start-1 min-w-0 pr-2 md:col-auto md:row-auto md:pr-0">
          <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--text-muted)]">
            <Target className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>{labelForCategory(goal.category)}</span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[var(--success)]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Completed
              </span>
            ) : goal.status === 'not-started' ? (
              <span>Not started</span>
            ) : null}
          </div>
          <Link
            href={`/goals/${goal.id}`}
            prefetch={false}
            className="mt-1 block truncate text-[15px] font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary-hover)]"
          >
            {goal.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[var(--text-secondary)]">
            {goal.description || 'No description'}
          </p>
        </div>

        <div className="col-span-2 row-start-2 min-w-0 md:col-auto md:row-auto">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Next milestone</p>
          <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{milestoneLabel}</p>
        </div>

        <div className="col-start-1 row-start-3 flex items-center gap-2 text-sm text-[var(--text-secondary)] md:col-auto md:row-auto">
          <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          {goal.dueDate ? (
            <span className={isOverdue ? 'text-[var(--danger)]' : undefined}>
              <span className="sr-only">Target </span>
              {formatDateOnly(goal.dueDate, { month: 'short', day: 'numeric', year: goal.dueDate.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined })}
              {isOverdue ? <span className="ml-1.5 font-medium">· Overdue</span> : null}
            </span>
          ) : (
            <span className="text-[var(--text-muted)]">—</span>
          )}
        </div>

        <div className="col-start-2 row-start-3 min-w-0 md:col-auto md:row-auto">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">Progress</span>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">{progress}%</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label={`${goal.title} progress: ${progress}%`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="col-start-2 row-start-1 flex items-center justify-end gap-1 md:col-auto md:row-auto">
          <Link
            href={`/goals/${goal.id}`}
            prefetch={false}
            className="app-icon-button h-10 w-10 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label={`Open ${goal.title}`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <GoalActionsMenu goal={goal} onDelete={onDelete} onUpdated={onUpdated} />
        </div>
      </div>
    </article>
  );
}
