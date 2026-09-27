export default function GoalsLoading() {
  return (
    <div className="app-page">
      <div className="h-8 w-24 animate-pulse rounded-[var(--radius-control)] bg-[var(--bg-surface-subtle)]" />
      <div className="h-12 animate-pulse rounded-[var(--radius-control)] bg-[var(--bg-surface-subtle)]" />
      <div className="overflow-hidden rounded-[var(--radius-container)] border border-[var(--border-subtle)]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid gap-4 border-b border-[var(--border-subtle)] p-5 last:border-b-0 md:grid-cols-2 xl:grid-cols-5">
            <div className="h-10 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
            <div className="h-4 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
            <div className="h-4 w-16 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
            <div className="h-2 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
            <div className="h-9 w-20 animate-pulse rounded bg-[var(--bg-surface-subtle)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
