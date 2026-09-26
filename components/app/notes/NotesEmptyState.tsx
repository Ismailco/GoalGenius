'use client';

interface NotesEmptyStateProps {
  hasActiveFilters: boolean;
  hasNotes: boolean;
  onClear: () => void;
  onNewNote: () => void;
}

export default function NotesEmptyState({ hasActiveFilters, hasNotes, onClear, onNewNote }: NotesEmptyStateProps) {
  if (hasNotes && hasActiveFilters) {
    return (
      <div className="app-empty-state px-5 py-10 text-center">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">No matching notes</h2>
        <button type="button" className="app-button-ghost app-button-sm mt-4" onClick={onClear}>Clear filters</button>
      </div>
    );
  }

  return (
    <div className="app-empty-state px-5 py-10 text-center">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">No notes yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-secondary)]">Capture information you want to keep nearby.</p>
      <button type="button" className="app-button mt-5" onClick={onNewNote}>New note</button>
    </div>
  );
}
