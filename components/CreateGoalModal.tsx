'use client';

import { GoalCategory, TimeFrame } from '@/app/types';
import { createGoal } from '@/app/lib/storage';
import { useModal } from '@/app/providers/ModalProvider';
import GoalInputForm from './GoalInputForm';
import AlertModal from './AlertModal';
import { useState } from 'react';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/app/lib/error';
import { LoadingOverlay } from './LoadingSpinner';

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
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
        aria-label="Create new goal"
      >
        <svg
          className="w-5 h-5 mr-2"
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
