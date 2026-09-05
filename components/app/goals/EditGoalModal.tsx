'use client';

import type { Goal } from '@/app/types';
import { useModal } from '@/app/providers/ModalProvider';
import GoalInputForm from '@/components/app/dashboard/GoalInputForm';
import { updateGoal } from '@/lib/storage';

export default function EditGoalModal({ goal }: { goal: Goal }) {
  const { showModal, hideModal } = useModal();

  return <button type="button" className="app-button-secondary" onClick={() => showModal({
    title: 'Edit Goal',
    content: <GoalInputForm
      initialData={{ title: goal.title, description: goal.description ?? '', category: goal.category, timeFrame: goal.timeFrame }}
      submitLabel="Save changes"
      onCancel={hideModal}
      onSubmit={async (data) => { await updateGoal(goal.id, data); hideModal(); window.location.reload(); }}
    />,
  })}>Edit goal</button>;
}
