export default function GoalDetailSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading goal">
      <div className="space-y-4 border-b border-[var(--border-default)] pb-6">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
        <div className="h-9 w-2/3 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
        <div className="flex gap-6 pt-3"><div className="h-8 flex-1 animate-pulse rounded bg-[var(--bg-surface-subtle)]" /><div className="h-8 w-28 animate-pulse rounded bg-[var(--bg-surface-subtle)]" /><div className="h-8 w-32 animate-pulse rounded bg-[var(--bg-surface-subtle)]" /></div>
      </div>
      {['Tasks', 'Milestones', 'Check-ins'].map((section) => (
        <section key={section} className="space-y-4" aria-hidden="true">
          <div className="flex justify-between"><div className="h-6 w-28 animate-pulse rounded bg-[var(--bg-surface-subtle)]" /><div className="h-9 w-24 animate-pulse rounded bg-[var(--bg-surface-subtle)]" /></div>
          <div className="space-y-1 border-y border-[var(--border-subtle)] py-2">
            {[0, 1, 2].map((row) => <div key={row} className="h-12 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />)}
          </div>
        </section>
      ))}
    </div>
  );
}
