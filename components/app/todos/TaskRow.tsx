'use client';

import Link from 'next/link';
import { CalendarClock, Check, Circle, Repeat2 } from 'lucide-react';
import type { Goal, Milestone, Todo } from '@/app/types';
import OverflowMenu from '@/components/app/shared/OverflowMenu';
import { formatDateOnly, parseDateOnly } from '@/lib/domain/date-only';
import { getTodoDueBucket } from '@/lib/domain/todos';

interface TaskRowProps {
  goal?: Goal;
  milestone?: Milestone;
  onDelete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onToggle: (todo: Todo) => void;
  pending: boolean;
  today: string;
  todo: Todo;
}

const recurrenceLabels: Record<Todo['recurrence'], string> = {
  none: '',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

function dueLabel(todo: Todo, today: string) {
  const bucket = getTodoDueBucket(todo, today);
  if (!todo.dueDate) return null;
  if (bucket === 'overdue') {
    return { label: `Overdue · ${formatDateOnly(todo.dueDate, { month: 'short', day: 'numeric' })}`, className: 'text-[var(--danger)]' };
  }
  if (bucket === 'today') return { label: 'Today', className: 'text-[var(--warning)]' };
  const tomorrow = parseDateOnly(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowValue = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  if (todo.dueDate === tomorrowValue) return { label: 'Tomorrow', className: 'text-[var(--text-secondary)]' };
  return {
    label: formatDateOnly(todo.dueDate, { month: 'short', day: 'numeric', year: todo.dueDate.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined }),
    className: 'text-[var(--text-secondary)]',
  };
}

function priorityLabel(priority: Todo['priority']) {
  if (priority === 'low') return null;
  return priority === 'high' ? 'High' : 'Medium';
}

export default function TaskRow({ goal, milestone, onDelete, onEdit, onToggle, pending, today, todo }: TaskRowProps) {
  const due = dueLabel(todo, today);
  const description = todo.description?.trim();
  const priority = priorityLabel(todo.priority);
  const recurrence = recurrenceLabels[todo.recurrence];

  return (
    <article className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-[var(--border-subtle)] py-4 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_minmax(9rem,auto)_auto] sm:items-center ${todo.completed ? 'opacity-75' : ''}`}>
      <button
        type="button"
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--brand-primary)] transition-colors hover:bg-[var(--bg-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
        onClick={() => onToggle(todo)}
        disabled={pending}
        aria-label={todo.completed ? `Mark ${todo.title} incomplete` : `Mark ${todo.title} complete`}
      >
        {todo.completed ? <Check className="h-5 w-5" aria-hidden="true" /> : <Circle className="h-5 w-5" aria-hidden="true" />}
      </button>

      <div className="min-w-0">
        <p className={`break-words text-sm font-semibold ${todo.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>{todo.title}</p>
        {description ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">{description}</p> : null}
        {(goal || milestone) ? (
          <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
            {goal ? <Link href={`/goals/${goal.id}`} prefetch={false} className="hover:text-[var(--text-primary)] hover:underline">{goal.title}</Link> : null}
            {goal && milestone ? <span className="px-1 text-[var(--text-muted)]" aria-hidden="true">·</span> : null}
            {milestone ? <span>{milestone.title}</span> : null}
          </p>
        ) : null}
      </div>

      <div className="col-span-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:col-span-1 sm:justify-end">
        {priority ? <span className={todo.priority === 'high' ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}>{priority}</span> : null}
        {recurrence ? <span className="inline-flex items-center gap-1 text-[var(--text-muted)]"><Repeat2 className="h-3.5 w-3.5" aria-hidden="true" />{recurrence}</span> : null}
        {due ? <span className={`inline-flex items-center gap-1 ${due.className}`}><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />{due.label}</span> : null}
      </div>

      <OverflowMenu ariaLabel={`Actions for ${todo.title}`}>
        <button type="button" role="menuitem" className="app-button-ghost flex w-full justify-start !px-3 !py-2 text-sm" onClick={() => onEdit(todo)}>Edit</button>
        <button type="button" role="menuitem" className="app-button-ghost flex w-full justify-start !px-3 !py-2 text-sm text-[var(--danger)] hover:text-[var(--danger)]" onClick={() => onDelete(todo)}>Delete</button>
      </OverflowMenu>
    </article>
  );
}
