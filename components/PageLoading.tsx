export default function PageLoading() {
  return (
    <div className="app-page">
      <div className="page-skeleton animate-pulse p-6">
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-2/5 rounded-2xl bg-white/10" />
        <div className="mt-3 h-4 w-1/3 rounded-full bg-white/5" />
      </div>
    </div>
  );
}
