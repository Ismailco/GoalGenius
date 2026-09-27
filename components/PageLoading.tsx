export default function PageLoading() {
  return (
    <div className="app-page">
      <div className="page-skeleton animate-pulse p-6">
        <div className="h-3 w-24 rounded-full bg-[var(--border-default)]" />
        <div className="mt-4 h-8 w-2/5 rounded-[var(--radius-control)] bg-[var(--border-default)]" />
        <div className="mt-3 h-4 w-1/3 rounded-full bg-[var(--border-subtle)]" />
      </div>
    </div>
  );
}
