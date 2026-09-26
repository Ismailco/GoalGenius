export default function NotesSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading notes" role="status">
      <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="page-skeleton h-8 w-28" />
          <div className="page-skeleton h-4 w-72 max-w-full" />
        </div>
        <div className="page-skeleton h-11 w-28" />
      </div>
      <div className="flex gap-3">
        <div className="page-skeleton h-11 flex-1" />
        <div className="page-skeleton h-11 w-44" />
      </div>
      <div className="surface-panel divide-y divide-[var(--border-subtle)] overflow-hidden">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="space-y-3 px-5 py-5">
            <div className="page-skeleton h-5 w-2/5" />
            <div className="page-skeleton h-4 w-4/5" />
            <div className="page-skeleton h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
