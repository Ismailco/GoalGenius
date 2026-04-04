'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';
import AddMilestone from '@/components/app/milestones/AddMilestone';
import MilestonesList from '@/components/app/milestones/MilestonesList';

export default function MilestonesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const timeframes = [
    { value: 'all', label: 'All Milestones' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'today', label: 'Today' },
    { value: 'past', label: 'Past' },
  ] as const;

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Milestones"
        title="See the path between start and finish"
        description="Filter upcoming work, review past milestones, and keep goal progress tied to concrete dates."
        action={<AddMilestone />}
      />

      <section className="surface-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search milestones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="app-field pr-11"
            />
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--text-muted)]">
              <Search className="h-4 w-4" />
            </div>
          </div>

          <div className="md:w-56">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as typeof selectedTimeframe)}
              className="app-select"
            >
              {timeframes.map((timeframe) => (
                <option key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="surface-panel overflow-hidden">
          <MilestonesList
            searchTerm={debouncedSearchTerm}
            timeframe={selectedTimeframe}
          />
      </section>
    </AppPage>
  );
}
