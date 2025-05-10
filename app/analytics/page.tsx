'use client';

import { LineChart, BarChart, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  const placeholderMetrics = [
    {
      title: 'Goal Completion Rate',
      description: 'Track your goal achievement progress over time',
      icon: <LineChart className="w-8 h-8 text-blue-400" />
    },
    {
      title: 'Milestone Distribution',
      description: 'Analyze how your milestones are spread across goals',
      icon: <PieChart className="w-8 h-8 text-purple-400" />
    },
    {
      title: 'Progress Trends',
      description: 'View your productivity and progress patterns',
      icon: <BarChart className="w-8 h-8 text-indigo-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute  left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Analytics</h1>
              <p className="text-gray-300 mt-2">Gain insights into your progress and achievements</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 Coming Soon!</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We're working on bringing you powerful analytics tools to help you track and improve your progress.
            Stay tuned for detailed insights, progress tracking, and performance metrics!
          </p>
        </div>

        {/* Placeholder Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {placeholderMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 transform hover:scale-[1.02] transition-all duration-200"
            >
              <div className="bg-white/5 rounded-2xl p-4 inline-block mb-4">
                {metric.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{metric.title}</h3>
              <p className="text-gray-400">{metric.description}</p>

              {/* Placeholder Animation */}
              <div className="mt-4 h-32 rounded-xl bg-gradient-to-r from-white/5 to-white/10 animate-pulse">
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Visualization Coming Soon</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Request Section */}
        <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Have suggestions?</h3>
            <p className="text-gray-400 mb-6">
              We're building this analytics dashboard for you! Let us know what metrics and insights would be most valuable for your goal tracking journey.
            </p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              onClick={() => alert('Feature request functionality coming soon!')}
            >
              Submit Feature Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
