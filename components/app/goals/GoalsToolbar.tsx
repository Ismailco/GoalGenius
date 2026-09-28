import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import type { GoalCategory } from '@/app/types';

interface GoalsToolbarProps {
  searchTerm: string;
  selectedCategory: GoalCategory | 'all';
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: GoalCategory | 'all') => void;
  goalIdeasAction: ReactNode;
}

const categories: { value: GoalCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All categories' },
  { value: 'health', label: 'Health' },
  { value: 'career', label: 'Career' },
  { value: 'learning', label: 'Learning' },
  { value: 'relationships', label: 'Relationships' },
];

export default function GoalsToolbar({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  goalIdeasAction,
}: GoalsToolbarProps) {
  return (
    <section className="flex flex-col gap-3 border-y border-[var(--border-subtle)] py-3 sm:flex-row sm:items-center" aria-label="Filter goals">
      <div className="relative flex-1">
        <label htmlFor="goal-search" className="sr-only">Search goals</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
        <input
          id="goal-search"
          type="search"
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="app-field !pl-10 !pr-10"
        />
        {searchTerm ? (
          <button
            type="button"
            className="app-icon-button absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
            aria-label="Clear goal search"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 sm:shrink-0 sm:items-center sm:flex-nowrap">
        <label htmlFor="goal-category" className="sr-only">Filter by category</label>
        <select
          id="goal-category"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value as GoalCategory | 'all')}
          className="app-select min-w-40 sm:w-48"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
        {goalIdeasAction}
      </div>
    </section>
  );
}
