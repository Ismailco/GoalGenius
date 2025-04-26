'use client';

import { Goal, Milestone } from '@/app/types';
import { createMilestone, getGoals } from '@/app/lib/storage';
import { useModal } from '@/app/providers/ModalProvider';
import MilestoneInputForm from './MilestoneInputForm';
import AlertModal from './AlertModal';
import { useState, useEffect } from 'react';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/app/lib/error';
import { LoadingOverlay } from './LoadingSpinner';

interface CreateMilestoneModalProps {
  goal?: Goal;  // Make goal optional
}

export default function CreateMilestoneModal({ goal: initialGoal }: CreateMilestoneModalProps) {
  const { hideModal } = useModal();
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(initialGoal);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
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
          const loadedGoals = getGoals();
          setGoals(loadedGoals);
        },
        setIsLoading,
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

  if (!selectedGoal && goals.length === 0) {
    return (
      <div className="text-center py-8" role="alert" aria-live="polite">
        <p className="text-gray-300 mb-4">Please create a goal first before adding milestones.</p>
        <button
          onClick={hideModal}
          className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close modal"
        >
          Close
        </button>
      </div>
    );
  }

  const handleSubmit = async (data: { title: string; description: string; date: string }) => {
    if (!selectedGoal) {
      setAlert({
        show: true,
        title: 'Goal Required',
        message: 'Please select a goal first',
        type: 'warning'
      });
      return;
    }

    await handleAsyncOperation(
      async () => {
        const milestone: Omit<Milestone, 'id'> = {
          goalId: selectedGoal.id,
          title: data.title,
          description: data.description,
          date: data.date
        };
        createMilestone(milestone);
        hideModal();
        window.location.reload();
      },
      setIsLoading,
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

  return (
    <>
      <div className="space-y-6 relative" role="dialog" aria-label="Create Milestone">
        {isLoading && <LoadingOverlay />}
        {!initialGoal && (
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">
              Select Goal
            </label>
            <select
              id="goal"
              value={selectedGoal?.id || ''}
              onChange={(e) => setSelectedGoal(goals.find(g => g.id === e.target.value))}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
              aria-label="Select a goal for the milestone"
              aria-invalid={!selectedGoal}
              aria-describedby={!selectedGoal ? "goal-error" : undefined}
            >
              <option value="">Select a goal</option>
              {Object.entries(
                goals.reduce((acc, goal) => {
                  if (!acc[goal.category]) {
                    acc[goal.category] = [];
                  }
                  acc[goal.category].push(goal);
                  return acc;
                }, {} as Record<string, Goal[]>)
              ).map(([category, categoryGoals]) => (
                <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                  {categoryGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        <MilestoneInputForm onSubmit={handleSubmit} onCancel={hideModal} />
      </div>

      {alert.show && (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          aria-label={`${alert.type} alert: ${alert.title}`}
          role="alertdialog"
        />
      )}
    </>
  );
}
