'use client';

import { RotateCcw, Search, X } from 'lucide-react';
import type { Goal } from '@/app/types';
import type { TodoStatusFilter as TaskStatusFilter } from '@/lib/domain/todos';

export type { TaskStatusFilter };

interface TasksToolbarProps {
  categories: string[];
  goalFilter: string;
  goals: Goal[];
  onCategoryChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onStatusChange: (value: TaskStatusFilter) => void;
  priorityFilter: string;
  query: string;
  statusFilter: TaskStatusFilter;
  hasActiveFilters: boolean;
  categoryFilter: string;
}

function FilterLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return <label htmlFor={htmlFor} className="sr-only">{children}</label>;
}

export default function TasksToolbar({
  categories,
  goalFilter,
  goals,
  onCategoryChange,
  onGoalChange,
  onPriorityChange,
  onQueryChange,
  onReset,
  onStatusChange,
  priorityFilter,
  query,
  statusFilter,
  hasActiveFilters,
  categoryFilter,
}: TasksToolbarProps) {
  return (
    <section aria-label="Task filters" className="border-y border-[var(--border-subtle)] py-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <FilterLabel htmlFor="task-search">Search tasks</FilterLabel>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
          <input
            id="task-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tasks..."
            className="app-field !pl-10 !pr-10"
          />
          {query ? (
            <button
              type="button"
              className="app-icon-button absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
              onClick={() => onQueryChange('')}
              aria-label="Clear task search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div>
          <FilterLabel htmlFor="task-goal-filter">Filter tasks by goal</FilterLabel>
          <select id="task-goal-filter" value={goalFilter} onChange={(event) => onGoalChange(event.target.value)} className="app-select">
            <option value="">All goals</option>
            <option value="standalone">Standalone tasks</option>
            {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
          </select>
        </div>

        <div>
          <FilterLabel htmlFor="task-priority-filter">Filter tasks by priority</FilterLabel>
          <select id="task-priority-filter" value={priorityFilter} onChange={(event) => onPriorityChange(event.target.value)} className="app-select">
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <FilterLabel htmlFor="task-status-filter">Filter tasks by status</FilterLabel>
          <select id="task-status-filter" value={statusFilter} onChange={(event) => onStatusChange(event.target.value as TaskStatusFilter)} className="app-select">
            <option value="open">Open</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>
        </div>

        <div>
          <FilterLabel htmlFor="task-category-filter">Filter tasks by category</FilterLabel>
          <select id="task-category-filter" value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)} className="app-select">
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
      </div>

      {hasActiveFilters ? (
        <button type="button" className="app-button-ghost app-button-sm mt-3 !px-0" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Clear filters
        </button>
      ) : null}
    </section>
  );
}
