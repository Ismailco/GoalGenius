export default function CheckInsSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-5">
        <div className="space-y-3">
          <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-72 animate-pulse rounded bg-white/5" />
        </div>
        <div className="h-11 w-28 animate-pulse rounded bg-white/10" />
      </div>
      <div className="app-surface p-5">
        <div className="h-5 w-36 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-white/5" />
        <div className="mt-6 h-28 animate-pulse rounded bg-white/5" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded border-y border-white/5 bg-white/[0.02]" />)}
      </div>
    </div>
  );
}
