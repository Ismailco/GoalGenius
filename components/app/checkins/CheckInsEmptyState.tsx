'use client';

import { ClipboardCheck } from 'lucide-react';

interface CheckInsEmptyStateProps {
  onCheckIn: () => void;
}

export default function CheckInsEmptyState({ onCheckIn }: CheckInsEmptyStateProps) {
  return (
    <section className="app-empty-state p-8 sm:p-10" aria-labelledby="check-ins-empty-heading">
      <div className="flex max-w-xl flex-col items-start gap-4">
        <ClipboardCheck className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
        <div>
          <h2 id="check-ins-empty-heading" className="text-base font-semibold text-[var(--text-primary)]">No check-ins yet</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Review what changed and decide what comes next.</p>
        </div>
        <button type="button" className="app-button" onClick={onCheckIn}>Check in</button>
      </div>
    </section>
  );
}
