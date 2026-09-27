'use client';

import { Goal } from '@/app/types';
import { useModal } from '@/app/providers/ModalProvider';
import CreateMilestoneModal from '@/components/app/dashboard/CreateMilestoneModal';
import { Plus } from 'lucide-react';

interface AddMilestoneProps {
  goal?: Goal;
  className?: string;
  label?: string;
  onCreated?: () => void | Promise<void>;
}

export default function AddMilestone({ goal, className = '', label = 'Add Milestone', onCreated }: AddMilestoneProps) {
  const { showModal } = useModal();

  const handleAddMilestone = () => {
    showModal({
      title: 'Create New Milestone',
      content: <CreateMilestoneModal goal={goal} onCreated={onCreated} />
    });
  };

  return (
    <button
      onClick={handleAddMilestone}
      className={`app-button ${className}`}
      aria-label={label}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
