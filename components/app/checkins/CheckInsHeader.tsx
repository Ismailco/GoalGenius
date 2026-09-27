'use client';

import { Plus } from 'lucide-react';

interface CheckInsHeaderProps {
  onCheckIn: () => void;
}

export default function CheckInsHeader({ onCheckIn }: CheckInsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-semibold tracking-[-0.025em] text-[var(--text-primary)]">
          Check-ins
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
          Review progress and decide what comes next.
        </p>
      </div>

      <button type="button" className="app-button self-start sm:self-auto" onClick={onCheckIn}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Check in
      </button>
    </header>
  );
}
