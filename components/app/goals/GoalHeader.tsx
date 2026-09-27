'use client';

import Link from 'next/link';
import { CalendarDays, Check, ChevronRight, Plus } from 'lucide-react';
import type { CheckIn, Goal } from '@/app/types';
import GoalActionsMenu from '@/components/app/goals/GoalActionsMenu';
import { formatDateOnly } from '@/lib/domain/date-only';

interface GoalHeaderProps {
  goal: Goal;
  lastCheckIn: CheckIn | null;
  onAddTask: () => void;
  onCheckIn: () => void;
  onRefresh: () => void;
  onUpdated: (goal: Goal) => void | Promise<void>;
  progress: number;
  refreshing: boolean;
  today: string;
}

function formatGoalDate(value: string, today: string) {
  return formatDateOnly(value, {
    month: 'short',
    day: 'numeric',
    year: value.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined,
  });
}

export default function GoalHeader({
  goal,
  lastCheckIn,
  onAddTask,
  onCheckIn,
  onRefresh,
  onUpdated,
  progress,
  refreshing,
  today,
}: GoalHeaderProps) {
  const isOverdue = goal.status !== 'completed' && Boolean(goal.dueDate && goal.dueDate < today);

  return (
    <header className="border-b border-[var(--border-default)] pb-6">
      <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-1 text-sm text-[var(--text-muted)]">
        <Link href="/goals" prefetch={false} className="app-button-ghost !min-h-0 !px-0 !py-1 hover:text-[var(--text-primary)]">
          Goals
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate text-[var(--text-secondary)]" aria-current="page">{goal.title}</span>
      </nav>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
            <span className="capitalize">{goal.category}</span>
            {goal.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 text-[var(--success)]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Completed
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 break-words text-[clamp(1.75rem,3vw,2rem)] font-semibold leading-tight tracking-[-0.025em] text-[var(--text-primary)]">
            {goal.title}
          </h1>
          {goal.description ? (
            <p className="mt-2 max-w-3xl text-[0.9375rem] leading-6 text-[var(--text-secondary)]">{goal.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="app-button" onClick={onAddTask}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </button>
          <button type="button" className="app-button-secondary" onClick={onCheckIn}>
            Check in
          </button>
          <GoalActionsMenu goal={goal} showDelete={false} onRefresh={onRefresh} onUpdated={onUpdated} />
          {refreshing ? <span className="sr-only" role="status">Refreshing goal</span> : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-[var(--border-subtle)] pt-4">
        <div className="min-w-[13rem] flex-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--text-muted)]">Progress</span>
            <span className="font-semibold text-[var(--text-primary)]">{progress}%</span>
          </div>
          <div
            className="progress-track mt-2"
            role="progressbar"
            aria-label={`${goal.title} progress: ${progress}%`}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {goal.dueDate ? (
          <div className="flex min-w-[9rem] items-start gap-2 text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Target</p>
              <p className={isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}>
                {formatGoalDate(goal.dueDate, today)}
                {isOverdue ? <span className="ml-1.5 font-medium">· Overdue</span> : null}
              </p>
            </div>
          </div>
        ) : null}

        <div className="min-w-[9rem] text-sm">
          <p className="text-xs text-[var(--text-muted)]">Last reviewed</p>
          <p className="text-[var(--text-secondary)]">
            {lastCheckIn ? formatGoalDate(lastCheckIn.date, today) : 'Not reviewed yet'}
          </p>
        </div>
      </div>
    </header>
  );
}
