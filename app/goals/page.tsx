'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { GoalCategory } from '@/app/types';
import CreateGoalModal from '@/components/app/dashboard/CreateGoalModal';
import GoalsList from '@/components/app/dashboard/GoalsList';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';

export default function GoalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categories: { value: GoalCategory | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'from-blue-500 to-purple-500' },
    { value: 'health', label: 'Health', color: 'from-green-500 to-emerald-500' },
    { value: 'career', label: 'Career', color: 'from-blue-500 to-indigo-500' },
    { value: 'learning', label: 'Learning', color: 'from-purple-500 to-pink-500' },
    { value: 'relationships', label: 'Relationships', color: 'from-red-500 to-pink-500' },
  ];

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Goals"
        title="Plan outcomes, not clutter"
        description="Review every goal in one clean workspace, then filter by category or search for a specific target."
        action={<CreateGoalModal />}
      />

      <section className="surface-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search goals..."
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GoalCategory | 'all')}
              className="app-select"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="surface-panel overflow-hidden">
          <GoalsList
            searchTerm={debouncedSearchTerm}
            selectedCategory={selectedCategory}
          />
      </section>
    </AppPage>
  );
}
