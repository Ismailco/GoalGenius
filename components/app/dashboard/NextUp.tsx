import Link from 'next/link';
import { CalendarDays, Check, Circle, Target } from 'lucide-react';
import type { Goal, Milestone, Todo } from '@/app/types';
import { formatDateOnly } from '@/lib/domain/date-only';

interface NextUpProps {
  goal: Goal | null;
  goalProgress: number | null;
  hasTasks: boolean;
  isCompleting: boolean;
  milestone: Milestone | null;
  onComplete: (todo: Todo) => void;
  onCreateTask: () => void;
  task: Todo | null;
  today: string;
}

function dueLabel(task: Todo, today: string) {
  if (!task.dueDate) return { label: 'No due date', className: 'text-[var(--text-muted)]' };
  if (task.dueDate < today) return { label: `Overdue · ${formatDateOnly(task.dueDate, { month: 'short', day: 'numeric' })}`, className: 'text-[var(--danger)]' };
  if (task.dueDate === today) return { label: 'Due today', className: 'text-[var(--warning)]' };
  return { label: `Due ${formatDateOnly(task.dueDate, { month: 'short', day: 'numeric' })}`, className: 'text-[var(--text-secondary)]' };
}

export default function NextUp({
  goal,
  goalProgress,
  hasTasks,
  isCompleting,
  milestone,
  onComplete,
  onCreateTask,
  task,
  today,
}: NextUpProps) {
  return (
    <section className="surface-panel p-5 md:p-6" aria-labelledby="next-up-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Next up</p>
          <h2 id="next-up-heading" className="text-lg font-semibold text-[var(--text-primary)]">
            Your next action
          </h2>
        </div>
        <Circle className="h-5 w-5 text-[var(--brand-primary)]" aria-hidden="true" />
      </div>

      {task ? (
        <div className="mt-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h3 className="break-words text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                {task.title}
              </h3>
              {task.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                  {task.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                {goal ? (
                  <Link
                    href={`/goals/${goal.id}`}
                    className="inline-flex min-h-8 items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <Target className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden="true" />
                    <span>{goal.title}</span>
                  </Link>
                ) : null}
                {milestone ? (
                  <span className="text-[var(--text-muted)]">Milestone · {milestone.title}</span>
                ) : null}
                <span className={`inline-flex items-center gap-1.5 font-medium ${dueLabel(task, today).className}`}>
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {dueLabel(task, today).label}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="app-button shrink-0"
              onClick={() => onComplete(task)}
              disabled={isCompleting}
              aria-label={`Mark ${task.title} complete`}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {isCompleting ? 'Completing…' : 'Complete task'}
            </button>
          </div>

          {goal && goalProgress !== null ? (
            <div className="mt-6 max-w-2xl">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-[var(--text-muted)]">Goal progress</span>
                <span className="font-semibold text-[var(--text-secondary)]">{goalProgress}%</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label={`${goal.title} progress`}
                aria-valuenow={goalProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="progress-fill" style={{ width: `${goalProgress}%` }} />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="app-empty-state mt-5 p-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {hasTasks ? "You're clear for now" : 'No tasks yet'}
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
            {hasTasks
              ? 'There are no unfinished actions waiting for you.'
              : 'Tasks turn goals into actions you can complete.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="app-button" onClick={onCreateTask}>
              Create task
            </button>
            <Link href={hasTasks ? '/todos' : '/goals'} className="app-button-secondary">
              {hasTasks ? 'View tasks' : 'View goals'}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
