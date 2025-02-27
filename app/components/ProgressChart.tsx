'use client';

import { useEffect, useCallback, useState } from 'react';
import { GoalCategory } from '@/app/types';
import { getGoals } from '@/app/lib/storage';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/app/lib/error';
import LoadingSpinner from './LoadingSpinner';

export default function ProgressChart() {
  const [loading, setLoading] = useState(true);
  const [categoryProgress, setCategoryProgress] = useState<Record<GoalCategory, number>>({
    health: 0,
    career: 0,
    learning: 0,
    relationships: 0,
  });

  const fetchCategoryProgress = useCallback(async () => {
    await handleAsyncOperation(
      async () => {
        const goals = getGoals();
        const progressByCategory: Record<GoalCategory, number[]> = {
          health: [],
          career: [],
          learning: [],
          relationships: [],
        };

        goals.forEach((goal) => {
          progressByCategory[goal.category].push(goal.progress);
        });

        const averageProgress = Object.entries(progressByCategory).reduce(
          (acc, [category, values]) => ({
            ...acc,
            [category]: values.length
              ? values.reduce((sum, val) => sum + val, 0) / values.length
              : 0,
          }),
          {} as Record<GoalCategory, number>
        );

        setCategoryProgress(averageProgress);
      },
      setLoading,
      (error) => {
        window.addNotification?.({
          title: 'Error',
          message: getUserFriendlyErrorMessage(error),
          type: 'error'
        });
      }
    );
  }, []);

  useEffect(() => {
    fetchCategoryProgress();
  }, [fetchCategoryProgress]);

  const getCategoryColor = (category: string) => {
    const colors = {
      health: 'from-green-500 to-emerald-500',
      career: 'from-blue-500 to-indigo-500',
      learning: 'from-purple-500 to-pink-500',
      relationships: 'from-rose-500 to-red-500',
    };
    return colors[category as keyof typeof colors] || 'from-blue-500 to-purple-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Goal Progress Overview">
      {Object.entries(categoryProgress).map(([category, progress]) => (
        <div key={category} className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 hover:scale-[1.02] transition-all duration-200 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white capitalize font-medium" id={`${category}-label`}>{category}</span>
            <span className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full" aria-live="polite">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              role="progressbar"
              aria-labelledby={`${category}-label`}
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`bg-gradient-to-r ${getCategoryColor(category)} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            >
              <div className="relative">
                <div className="absolute -right-1 -top-1 w-5 h-5 bg-white rounded-full transform -translate-y-1/2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400" aria-hidden="true">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      ))}

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-4 border border-white/10" role="region" aria-label="Overall Progress Summary">
        <h3 className="text-white font-medium mb-2">Overall Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm" id="average-label">Average</p>
            <p className="text-2xl font-bold text-white" aria-labelledby="average-label" role="status" aria-live="polite">
              {Math.round(
                Object.values(categoryProgress).reduce((a, b) => a + b, 0) /
                  Object.values(categoryProgress).length
              )}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm" id="categories-label">Categories</p>
            <p className="text-2xl font-bold text-white" aria-labelledby="categories-label" role="status" aria-live="polite">
              {Object.values(categoryProgress).filter((p) => p > 0).length}/
              {Object.values(categoryProgress).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
