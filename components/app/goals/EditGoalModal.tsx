'use client';

import type { Goal } from '@/app/types';
import { useModal } from '@/app/providers/ModalProvider';
import GoalInputForm from '@/components/app/dashboard/GoalInputForm';
import { updateGoal } from '@/lib/storage';
import { Pencil } from 'lucide-react';

interface EditGoalModalProps {
  goal: Goal;
  onOpen?: () => void;
  onUpdated?: (goal: Goal) => void | Promise<void>;
  className?: string;
  role?: 'menuitem';
  label?: string;
}

function normalizeTimeFrame(value: Goal['timeFrame']): Goal['timeFrame'] {
  const normalized = String(value).toLowerCase();
  if (normalized === 'long-term' || normalized.includes('6+')) return 'long-term';
  if (normalized === 'medium-term' || normalized.includes('3-6')) return 'medium-term';
  return 'short-term';
}

export default function EditGoalModal({
  goal,
  onOpen,
  onUpdated,
  className = 'app-button-secondary',
  role,
  label = 'Edit goal',
}: EditGoalModalProps) {
  const { showModal, hideModal } = useModal();

  return (
    <button
      type="button"
      role={role}
      className={className}
      aria-label={`${label}: ${goal.title}`}
      onClick={() => {
        onOpen?.();
        showModal({
          title: `Edit ${goal.title}`,
          content: <GoalInputForm
            initialData={{ title: goal.title, description: goal.description ?? '', category: goal.category, timeFrame: normalizeTimeFrame(goal.timeFrame) }}
            submitLabel="Save changes"
            onCancel={hideModal}
            onSubmit={async (data) => {
              const updatedGoal = await updateGoal(goal.id, {
                ...data,
                status: goal.status,
                progress: goal.progress,
                ...(goal.dueDate ? { dueDate: goal.dueDate } : {}),
              });
              hideModal();
              if (onUpdated) {
                await onUpdated(updatedGoal);
              } else {
                window.location.reload();
              }
            }}
          />,
        });
      }}
    >
      {role === 'menuitem' ? <Pencil className="h-4 w-4" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}
