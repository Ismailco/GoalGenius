'use client';

import { useEffect, useCallback, useState } from 'react';
import { GoalCategory } from '@/app/types';
import { getGoals } from '@/lib/storage';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
        const goals = await getGoals();
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
      health: 'from-emerald-400 to-cyan-400',
      career: 'from-blue-400 to-sky-500',
      learning: 'from-cyan-400 to-blue-500',
      relationships: 'from-slate-300 to-blue-400',
    };
    return colors[category as keyof typeof colors] || 'from-blue-400 to-sky-500';
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
        <div key={category} className="surface-card p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white capitalize font-medium" id={`${category}-label`}>{category}</span>
            <span className="app-pill app-pill-blue" aria-live="polite">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-track !h-3">
            <div
              role="progressbar"
              aria-labelledby={`${category}-label`}
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category)} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]" aria-hidden="true">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      ))}

      <div className="surface-card p-4" role="region" aria-label="Overall Progress Summary">
        <h3 className="text-white font-medium mb-2">Overall Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]" id="average-label">Average</p>
            <p className="text-2xl font-bold text-white" aria-labelledby="average-label" role="status" aria-live="polite">
              {Math.round(
                Object.values(categoryProgress).reduce((a, b) => a + b, 0) /
                  Object.values(categoryProgress).length
              )}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]" id="categories-label">Categories</p>
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
