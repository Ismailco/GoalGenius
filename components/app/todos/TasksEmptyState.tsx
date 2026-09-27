'use client';

interface TasksEmptyStateProps {
  hasActiveFilters: boolean;
  hasAnyTasks: boolean;
  onClearFilters: () => void;
  onNewTask: () => void;
  onViewGoals: () => void;
  status: 'open' | 'completed' | 'all';
}

export default function TasksEmptyState({ hasActiveFilters, hasAnyTasks, onClearFilters, onNewTask, onViewGoals, status }: TasksEmptyStateProps) {
  if (!hasAnyTasks) {
    return (
      <div className="app-empty-state px-5 py-10 text-center">
        <p className="font-medium text-[var(--text-primary)]">No tasks yet</p>
        <p className="mt-1 text-sm">Create a task or add one from a goal.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="app-button" onClick={onNewTask}>New task</button>
          <button type="button" className="app-button-secondary" onClick={onViewGoals}>View goals</button>
        </div>
      </div>
    );
  }

  if (hasActiveFilters) {
    return (
      <div className="app-empty-state px-5 py-10 text-center">
        <p className="font-medium text-[var(--text-primary)]">No matching tasks</p>
        <button type="button" className="app-button-ghost mt-4" onClick={onClearFilters}>Clear filters</button>
      </div>
    );
  }

  return (
    <div className="app-empty-state px-5 py-10 text-center">
      <p className="font-medium text-[var(--text-primary)]">{status === 'completed' ? 'No completed tasks' : 'No open tasks'}</p>
      <p className="mt-1 text-sm">{status === 'completed' ? 'Completed work will appear here.' : 'All current tasks are complete.'}</p>
    </div>
  );
}
