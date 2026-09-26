export default function TasksSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading Tasks">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="h-8 w-28 rounded bg-white/10" />
          <div className="mt-3 h-4 w-56 rounded bg-white/5" />
        </div>
        <div className="h-11 w-32 rounded bg-white/10" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-11 rounded bg-white/5" />)}
      </div>
      <div className="space-y-3">
        <div className="h-5 w-24 rounded bg-white/10" />
        <div className="border-y border-white/5">
          {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 border-b border-white/5 last:border-b-0" />)}
        </div>
      </div>
    </div>
  );
}
