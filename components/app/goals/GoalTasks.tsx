'use client';

import { Check, Circle, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Milestone, Todo } from '@/app/types';
import { formatDateOnly } from '@/lib/domain/date-only';

interface GoalTasksProps {
  milestonesById: Map<string, Milestone>;
  onAddTask: () => void;
  onToggle: (todo: Todo) => void;
  pendingTodoId: string | null;
  today: string;
  todos: Todo[];
}

function dueLabel(todo: Todo, today: string) {
  if (!todo.dueDate) return null;
  if (todo.dueDate < today) return { label: 'Overdue', className: 'text-[var(--danger)]' };
  if (todo.dueDate === today) return { label: 'Today', className: 'text-[var(--warning)]' };
  return {
    label: formatDateOnly(todo.dueDate, { month: 'short', day: 'numeric', year: todo.dueDate.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined }),
    className: 'text-[var(--text-secondary)]',
  };
}

function GoalTaskRow({ milestone, onToggle, pending, todo, today }: { milestone?: Milestone; onToggle: (todo: Todo) => void; pending: boolean; todo: Todo; today: string }) {
  const due = dueLabel(todo, today);
  const description = todo.description?.trim();

  return (
    <div className={`flex items-start gap-3 border-b border-[var(--border-subtle)] py-3.5 last:border-b-0 ${todo.completed ? 'opacity-70' : ''}`}>
      <button
        type="button"
        className="mt-0.5 shrink-0 rounded-md text-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onToggle(todo)}
        disabled={pending}
        aria-label={`${todo.completed ? 'Mark' : 'Mark'} ${todo.title} ${todo.completed ? 'incomplete' : 'complete'}`}
      >
        {todo.completed ? <Check className="h-5 w-5" aria-hidden="true" /> : <Circle className="h-5 w-5" aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`break-words text-sm font-medium ${todo.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>{todo.title}</p>
        {description ? <p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">{description}</p> : null}
        {milestone ? <p className="mt-1 truncate text-xs text-[var(--text-muted)]">Milestone: {milestone.title}</p> : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
        {todo.priority !== 'low' ? <span className="capitalize text-[var(--text-muted)]">{todo.priority}</span> : null}
        {due ? <span className={due.className}>{due.label}</span> : null}
      </div>
    </div>
  );
}

export default function GoalTasks({ milestonesById, onAddTask, onToggle, pendingTodoId, today, todos }: GoalTasksProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const openTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <section aria-labelledby="goal-tasks-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="goal-tasks-heading" className="text-lg font-semibold text-[var(--text-primary)]">Tasks</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Work linked to this goal and its milestones.</p>
        </div>
        <button type="button" className="app-button-secondary app-button-sm" onClick={onAddTask}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add task
        </button>
      </div>

      {todos.length === 0 ? (
        <div className="app-empty-state mt-4 px-5 py-6">
          <p className="font-medium text-[var(--text-primary)]">No tasks yet</p>
          <p className="mt-1 text-sm">Add the next action for this goal.</p>
          <button type="button" className="app-button mt-4" onClick={onAddTask}>Add task</button>
        </div>
      ) : (
        <div className="mt-3 border-y border-[var(--border-default)]">
          {openTodos.length > 0 ? openTodos.map((todo) => (
            <GoalTaskRow key={todo.id} milestone={todo.milestoneId ? milestonesById.get(todo.milestoneId) : undefined} onToggle={onToggle} pending={pendingTodoId === todo.id} todo={todo} today={today} />
          )) : (
            <p className="py-4 text-sm text-[var(--text-muted)]">No open tasks.</p>
          )}
          {completedTodos.length > 0 ? (
            <div className="border-t border-[var(--border-subtle)] py-2">
              <button type="button" className="app-button-ghost app-button-sm" aria-expanded={showCompleted} onClick={() => setShowCompleted((visible) => !visible)}>
                {showCompleted ? 'Hide completed' : `Show completed (${completedTodos.length})`}
              </button>
              {showCompleted ? completedTodos.map((todo) => (
                <GoalTaskRow key={todo.id} milestone={todo.milestoneId ? milestonesById.get(todo.milestoneId) : undefined} onToggle={onToggle} pending={pendingTodoId === todo.id} todo={todo} today={today} />
              )) : null}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
