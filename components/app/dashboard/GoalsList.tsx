'use client';

import { useEffect, useState } from 'react';
import { Goal, GoalCategory, TimeFrame } from '@/app/types';
import { getGoals, updateGoal, deleteGoal } from '@/lib/storage';
import AlertModal from '@/components/common/AlertModal';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingPage } from '@/components/common/LoadingSpinner';

export default function GoalsList({
  searchTerm = '',
  selectedCategory = 'all'
}: {
  searchTerm?: string;
  selectedCategory?: GoalCategory | 'all';
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  // const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirmation?: boolean;
    onConfirm?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    const loadGoals = async () => {
      await handleAsyncOperation(
        async () => {
          const loadedGoals = await getGoals();
          setGoals(loadedGoals);
        },
        setLoading,
        (error) => {
          setAlert({
            show: true,
            title: 'Error',
            message: getUserFriendlyErrorMessage(error),
            type: 'error'
          });
        }
      );
    };

    loadGoals();
  }, []);

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    await handleAsyncOperation(
      async () => {
        await updateGoal(goalId, { progress });
        const updatedGoals = await getGoals();
        setGoals(updatedGoals);
      },
      undefined,
      (error) => {
        setAlert({
          show: true,
          title: 'Error',
          message: getUserFriendlyErrorMessage(error),
          type: 'error'
        });
      }
    );
  };

  const handleDeleteGoal = (id: string) => {
    setAlert({
			show: true,
			title: 'Confirm Deletion',
			message: 'Are you sure you want to delete this goal?',
			type: 'warning',
			isConfirmation: true,
			onConfirm: async () => {
				try {
					// console.log('Deleting goal with id:', id);
					await deleteGoal(id);
					const updatedGoals = await getGoals();
					setGoals(updatedGoals);
				} catch (error) {
					console.error('Delete goal error:', error);
					setAlert({
						show: true,
						title: 'Error',
						message: getUserFriendlyErrorMessage(error),
						type: 'error',
					});
				}
			},
		});
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const filteredUpdates = { ...updates };
      delete filteredUpdates.createdAt;

      // Call the updateGoal function
      await updateGoal(id, filteredUpdates);

      // Get updated goals
      const updatedGoals = await getGoals();

      // Update the state with the new list of goals
      setGoals(updatedGoals);

      // Clear the editing goal state
      setEditingGoal(null);
    } catch (error) {
      // Log the error
      console.error('[Update Goal Error]:', error);

      // Set an alert with a user-friendly error message
      setAlert({
        show: true,
        title: 'Error',
        message: getUserFriendlyErrorMessage(error),
        type: 'error',
      });
    }
  };

  // Filter goals based on search term and category
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = searchTerm === '' ||
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-3 p-4 md:p-6" role="region" aria-label="Goals list">
      {filteredGoals.length === 0 ? (
        <div className="surface-empty px-6 py-10 text-center">
          <p className="text-lg" role="status" aria-label="No goals found">
            {goals.length === 0 ?
              "No goals yet. Add your first goal!" :
              "No goals match your search criteria."}
          </p>
        </div>
      ) : (
        filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="surface-card p-5"
            role="article"
            aria-label={`Goal: ${goal.title}`}
          >
            {editingGoal?.id === goal.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="app-field"
                  aria-label="Edit goal title"
                />
                <textarea
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  className="app-field"
                  aria-label="Edit goal description"
                />
                <select
                  value={editingGoal.category}
                  onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value as GoalCategory })}
                  className="app-select"
                  aria-label="Select goal category"
                >
                  <option value="health">Health</option>
                  <option value="career">Career</option>
                  <option value="learning">Learning</option>
                  <option value="relationships">Relationships</option>
                </select>
                <select
                  value={editingGoal.timeFrame}
                  onChange={(e) => setEditingGoal({ ...editingGoal, timeFrame: e.target.value as TimeFrame })}
                  className="app-select"
                  aria-label="Select goal timeframe"
                >
                  <option value="short-term">Short Term</option>
                  <option value="medium-term">Medium Term</option>
                  <option value="long-term">Long Term</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingGoal(null)}
                    className="app-button-secondary"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateGoal(goal.id, editingGoal)}
                    className="app-button"
                    aria-label="Save goal changes"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="app-pill app-pill-blue text-[11px]">
                        {goal.category}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        {goal.timeFrame}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{goal.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {goal.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                      aria-label={`Edit goal: ${goal.title}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[rgba(255,111,130,0.12)] hover:text-[rgb(255,220,226)]"
                      aria-label={`Delete goal: ${goal.title}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      Progress
                    </span>
                    <span className="text-sm font-semibold text-white">{goal.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                      role="progressbar"
                      aria-valuenow={goal.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Goal progress: ${goal.progress}%`}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-[var(--text-secondary)]" aria-label="Goal timeframe">{goal.timeFrame}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                      className="app-field !w-20 !px-3 !py-2 text-sm text-center"
                      aria-label={`Update progress for ${goal.title}`}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}

      {alert.show && (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          isConfirmation={alert.isConfirmation}
          onConfirm={alert.onConfirm}
          aria-label={`${alert.type} alert: ${alert.title}`}
          role="alertdialog"
        />
      )}
    </div>
  );
}
