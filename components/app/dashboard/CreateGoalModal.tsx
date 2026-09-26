'use client';

import { Goal, GoalCategory, TimeFrame } from '@/app/types';
import { createGoal } from '@/lib/storage';
import { useModal } from '@/app/providers/ModalProvider';
import GoalInputForm from '@/components/app/dashboard/GoalInputForm';
import AlertModal from '@/components/common/AlertModal';
import { useState } from 'react';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Plus } from 'lucide-react';

interface CreateGoalModalProps {
  onCreated?: (goal: Goal) => void | Promise<void>;
  label?: string;
}

export default function CreateGoalModal({ onCreated, label = 'Add Goal' }: CreateGoalModalProps) {
  const { showModal, hideModal } = useModal();
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

  const handleSubmit = async (data: {
    title: string;
    description: string;
    category: GoalCategory;
    timeFrame: TimeFrame;
  }) => {
    await handleAsyncOperation(
      async () => {
        const createdGoal = await createGoal({
          ...data,
          status: 'not-started',
          progress: 0,
        });
        hideModal();
        if (onCreated) {
          await onCreated(createdGoal);
        } else {
          window.location.reload();
        }
      },
      setIsLoading,
      (error) => {
        setAlert({
          show: true,
          title: 'Error',
          message: getUserFriendlyErrorMessage(error),
          type: 'error',
        });
      }
    );
  };

  return (
    <>
      <button
        onClick={() => showModal({
          title: 'Create New Goal',
          content: (
            <div className="relative">
              {isLoading && <LoadingOverlay />}
              <GoalInputForm onSubmit={handleSubmit} onCancel={hideModal} isSubmitting={isLoading} />
            </div>
          )
        })}
        className="app-button"
        aria-label="Create new goal"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>

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
