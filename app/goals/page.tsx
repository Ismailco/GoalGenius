'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { GoalCategory } from '@/app/types';
import CreateGoalModal from '@/components/app/dashboard/CreateGoalModal';
import GoalsList from '@/components/app/dashboard/GoalsList';

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
    <div className="min-h-screen bg-slate-900">
      <div className="absolute  left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 transform hover:scale-[1.01] transition-transform border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Your Goals</h1>
              <p className="text-gray-300 mt-2">Transform your aspirations into achievements</p>
            </div>
            <CreateGoalModal />
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GoalCategory | 'all')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Goals List */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10">
          <GoalsList
            searchTerm={debouncedSearchTerm}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
}
