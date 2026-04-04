'use client';

import { useEffect, useState } from 'react';
import { Milestone, Goal, GoalCategory } from '@/app/types';
import { getMilestones, getGoals } from '@/lib/storage';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingPage } from '@/components/common/LoadingSpinner';
// import CreateMilestoneModal from '@/app/components/CreateMilestoneModal';
// import { useModal } from '@/app/providers/ModalProvider';

export default function MilestoneTimeline() {
  const [mounted, setMounted] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [groupedGoals, setGroupedGoals] = useState<Record<GoalCategory, Goal[]>>({
    health: [],
    career: [],
    learning: [],
    relationships: [],
  });
  // const { showModal } = useModal();

  useEffect(() => {
    const loadData = async () => {
      await handleAsyncOperation(
        async () => {
          setMounted(true);
          const [loadedMilestones, loadedGoals] = await Promise.all([
            getMilestones(),
            getGoals()
          ]);
          setMilestones(loadedMilestones);
          setGoals(loadedGoals);
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
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!mounted || !goals.length) return;

    const grouped = goals.reduce((acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = [];
      }
      acc[goal.category].push(goal);
      return acc;
    }, {} as Record<GoalCategory, Goal[]>);

    setGroupedGoals(grouped);
  }, [goals, mounted]);

  const getStatusColor = (progress: number) => {
    if (progress === 100) return 'bg-gradient-to-r from-emerald-400 to-cyan-400';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-400 to-sky-500';
    return 'bg-gradient-to-r from-slate-400 to-blue-400';
  };

  const getCategoryIcon = (category: GoalCategory) => {
    const icons = {
      health: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      ),
      career: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
      learning: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      ),
      relationships: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
    };
    return icons[category];
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-12" role="region" aria-label="Goals and milestones timeline">
      {Object.entries(groupedGoals).map(([category, goals]) => (
        goals.length > 0 && (
          <div key={category} className="space-y-8" role="region" aria-label={`${category} goals timeline`}>
            <div className="flex items-center gap-3">
              <div className="icon-chip h-11 w-11 rounded-[16px]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {getCategoryIcon(category as GoalCategory)}
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white capitalize" id={`${category}-timeline-heading`}>{category}</h2>
            </div>

            <div className="relative">
              <div className="absolute bottom-0 left-8 top-0 w-px bg-[rgba(93,166,255,0.18)]" aria-hidden="true"></div>
              <div className="space-y-8">
                {goals.map((goal) => (
                  <div key={goal.id} className="relative flex items-start group" role="article" aria-labelledby={`goal-${goal.id}-title`}>
                    <div className={`
                      absolute left-8 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white/10
                      ${getStatusColor(goal.progress)}
                    `} aria-hidden="true">
                      <div className="absolute inset-0 rounded-full bg-white/20 opacity-50"></div>
                    </div>

                    <div className="surface-card ml-16 w-full p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 id={`goal-${goal.id}-title`} className="text-lg font-semibold text-white">{goal.title}</h3>
                          <p className="text-sm text-[var(--text-secondary)]" aria-label={`Timeframe: ${goal.timeFrame}`}>{goal.timeFrame}</p>
                        </div>
                        <span className={`
                          rounded-full px-3 py-1 text-sm font-medium
                          ${goal.progress === 100 ? 'bg-green-500/20 text-green-300' :
                            goal.progress >= 50 ? 'bg-blue-500/20 text-blue-100' :
                            'bg-white/10 text-[var(--text-secondary)]'}
                        `} role="status" aria-label={`Goal progress: ${goal.progress}% complete`}>
                          {goal.progress}% Complete
                        </span>
                      </div>

                      <p className="mb-4 text-[var(--text-secondary)]" id={`goal-${goal.id}-description`}>{goal.description}</p>

                      <div className="progress-track">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(goal.progress)}`}
                          style={{ width: `${goal.progress}%` }}
                          role="progressbar"
                          aria-valuenow={goal.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Progress for ${goal.title}`}
                        />
                      </div>

                      <div className="mt-4 space-y-2" role="list" aria-label={`Milestones for ${goal.title}`}>
                        {milestones
                          .filter(milestone => milestone.goalId === goal.id)
                          .map((milestone) => (
                            <div
                              key={milestone.id}
                              className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-[rgba(8,17,30,0.52)] px-3 py-3 text-[var(--text-secondary)]"
                              role="listitem"
                              aria-labelledby={`milestone-${milestone.id}-title`}
                            >
                              <svg
                                className="h-4 w-4 text-[var(--accent)]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <div>
                                <span id={`milestone-${milestone.id}-title`} className="text-sm font-medium">{milestone.title}</span>
                                <p className="text-xs text-[var(--text-secondary)]" aria-label={`Milestone description: ${milestone.description}`}>{milestone.description}</p>
                                <span className="text-xs text-[var(--text-muted)]" aria-label={`Due date: ${new Date(milestone.date).toLocaleDateString()}`}>Due: {new Date(milestone.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
}
