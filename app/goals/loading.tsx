export default function GoalsLoading() {
  return (
    <div className="min-h-screen p-8 relative bg-slate-900">
      <div className="absolute  left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="max-w-6xl mx-auto relative">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-32 bg-slate-700/50 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-slate-700/50 rounded-lg animate-pulse"></div>
          </div>

          {/* Goals Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-700/50 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-full bg-slate-700/50 rounded mb-4 animate-pulse"></div>
                <div className="h-2 w-full bg-slate-700/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
