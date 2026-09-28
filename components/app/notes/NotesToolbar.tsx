'use client';

import { Search, X } from 'lucide-react';

interface NotesToolbarProps {
  categories: string[];
  category: string;
  query: string;
  onCategoryChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function NotesToolbar({
  categories,
  category,
  query,
  onCategoryChange,
  onQueryChange,
  onClear,
  hasActiveFilters,
}: NotesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <label htmlFor="notes-search" className="sr-only">Search notes</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
          <input
            id="notes-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search notes"
            className="app-field !pl-10"
          />
        </div>
      </div>

      <div className="sm:w-52">
        <label htmlFor="notes-category" className="sr-only">Category</label>
        <select
          id="notes-category"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="app-select"
        >
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {hasActiveFilters ? (
        <button type="button" className="app-button-ghost app-button-sm self-start sm:self-auto" onClick={onClear}>
          <X className="h-4 w-4" aria-hidden="true" />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
