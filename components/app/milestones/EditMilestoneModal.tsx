'use client';

import { Goal, Milestone } from '@/app/types';
import { updateMilestone, getGoals } from '@/lib/storage';
import { useModal } from '@/app/providers/ModalProvider';
import MilestoneInputForm from '@/components/app/dashboard/MilestoneInputForm';
import AlertModal from '@/components/common/AlertModal';
import { useState, useEffect } from 'react';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';

interface EditMilestoneModalProps {
  milestone: Milestone;
  onUpdate: (updatedMilestone: Milestone) => void;
}

export default function EditMilestoneModal({ milestone, onUpdate }: EditMilestoneModalProps) {
  const { hideModal } = useModal();
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

  const handleSubmit = async (data: { title: string; description: string; date: string }) => {
    await handleAsyncOperation(
      async () => {
        const updatedMilestone = await updateMilestone(milestone.id, {
          ...data,
          goalId: milestone.goalId // Preserve the original goalId
        });
        onUpdate(updatedMilestone);
        hideModal();
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
    <div className="space-y-6 relative" role="dialog" aria-label="Edit Milestone">
      {isLoading && <LoadingOverlay />}

      <MilestoneInputForm
        onSubmit={handleSubmit}
        onCancel={hideModal}
        initialData={{
          title: milestone.title,
          description: milestone.description || '',
          date: milestone.date
        }}
      />

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
    </div>
  );
}
