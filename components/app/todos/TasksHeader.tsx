'use client';

import { Plus } from 'lucide-react';

interface TasksHeaderProps {
  onNewTask: () => void;
}

export default function TasksHeader({ onNewTask }: TasksHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
      <div>
        <h1 className="text-[clamp(1.75rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-[var(--text-primary)]">Tasks</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Manage work across your goals.</p>
      </div>
      <button type="button" className="app-button" onClick={onNewTask}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        New task
      </button>
    </header>
  );
}
