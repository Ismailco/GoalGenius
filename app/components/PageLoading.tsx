export default function PageLoading() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-8 bg-white/10 rounded-xl w-3/4"></div>
              <div className="h-4 bg-white/5 rounded-xl w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
