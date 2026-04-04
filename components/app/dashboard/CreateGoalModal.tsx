'use client';

import { GoalCategory, TimeFrame } from '@/app/types';
import { createGoal } from '@/lib/storage';
import { useModal } from '@/app/providers/ModalProvider';
import GoalInputForm from '@/components/app/dashboard/GoalInputForm';
import AlertModal from '@/components/common/AlertModal';
import { useState } from 'react';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';

export default function CreateGoalModal() {
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
        createGoal({
          ...data,
          status: 'not-started',
          progress: 0,
        });
        hideModal();
        window.location.reload();
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
              <GoalInputForm onSubmit={handleSubmit} onCancel={hideModal} />
            </div>
          )
        })}
        className="app-button"
        aria-label="Create new goal"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Goal
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
