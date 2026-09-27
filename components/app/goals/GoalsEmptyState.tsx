import type { ReactNode } from 'react';

interface GoalsEmptyStateProps {
  hasGoals: boolean;
  onClearFilters: () => void;
  createGoalAction: ReactNode;
  goalIdeasAction: ReactNode;
}

export default function GoalsEmptyState({
  hasGoals,
  onClearFilters,
  createGoalAction,
  goalIdeasAction,
}: GoalsEmptyStateProps) {
  if (hasGoals) {
    return (
      <div className="app-empty-state px-5 py-10 text-center">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">No matching goals</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Clear the current filters to see all goals.</p>
        <button type="button" onClick={onClearFilters} className="app-button-secondary mt-4">Clear filters</button>
      </div>
    );
  }

  return (
    <div className="app-empty-state px-5 py-10">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">No goals yet</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
        Create a goal, then break it into milestones and tasks.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {createGoalAction}
        {goalIdeasAction}
      </div>
    </div>
  );
}
