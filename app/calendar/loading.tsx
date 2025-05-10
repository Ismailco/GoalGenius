export default function CalendarLoading() {
  return (
    <div className="min-h-screen p-8 relative bg-slate-900">
      <div className="absolute  left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="max-w-6xl mx-auto relative">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
          {/* Calendar Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-slate-700/50 rounded-full animate-pulse"></div>
              <div className="h-10 w-10 bg-slate-700/50 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Calendar Grid Skeleton */}
          <div className="grid grid-cols-7 gap-2">
            {/* Days of week headers */}
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="text-center py-2"
              >
                <div className="h-4 w-8 bg-slate-700/50 rounded mx-auto animate-pulse"></div>
              </div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: 35 }).map((_, index) => (
              <div
                key={index}
                className="h-24 border border-slate-700/50 rounded-lg p-2 backdrop-blur-sm"
              >
                <div className="h-4 w-4 bg-slate-700/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
