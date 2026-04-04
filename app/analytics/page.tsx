'use client';

import { BarChart, LineChart, PieChart } from 'lucide-react';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';

export default function AnalyticsPage() {
  const placeholderMetrics = [
    {
      title: 'Goal Completion Rate',
      description: 'Track your goal achievement progress over time',
      icon: <LineChart className="h-8 w-8 text-[var(--accent)]" />,
    },
    {
      title: 'Milestone Distribution',
      description: 'Analyze how your milestones are spread across goals',
      icon: <PieChart className="h-8 w-8 text-[var(--accent)]" />,
    },
    {
      title: 'Progress Trends',
      description: 'View your productivity and progress patterns',
      icon: <BarChart className="h-8 w-8 text-[var(--accent)]" />,
    },
  ];

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Analytics"
        title="Insights will stay clear and restrained"
        description="The analytics area is staged for richer reporting without adding noise to the core planning flow."
      />

      <section className="surface-panel p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">Coming Soon!</h2>
        <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
          We&apos;re working on bringing you powerful analytics tools to help you track and improve your progress.
          Stay tuned for detailed insights, progress tracking, and performance metrics!
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {placeholderMetrics.map((metric, index) => (
          <div key={index} className="surface-card p-6">
            <div className="icon-chip mb-4 h-14 w-14 rounded-[20px]">{metric.icon}</div>
            <h3 className="mb-2 text-xl font-semibold text-white">{metric.title}</h3>
            <p className="text-[var(--text-secondary)]">{metric.description}</p>

            <div className="mt-4 h-32 rounded-[18px] border border-white/10 bg-[rgba(8,17,30,0.52)] animate-pulse">
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[var(--text-muted)]">Visualization Coming Soon</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="surface-panel p-6">
        <div className="text-center">
          <h3 className="mb-4 text-xl font-semibold text-white">Have suggestions?</h3>
          <p className="mb-6 text-[var(--text-secondary)]">
            We&apos;re building this analytics dashboard for you! Let us know what metrics and insights would be most valuable for your goal tracking journey.
          </p>
          <button
            className="app-button"
            onClick={() => alert('Feature request functionality coming soon!')}
          >
            Submit Feature Request
          </button>
        </div>
      </section>
    </AppPage>
  );
}
