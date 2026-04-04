'use client';

import { Goal } from '@/app/types';
import { useModal } from '@/app/providers/ModalProvider';
import CreateMilestoneModal from '@/components/app/dashboard/CreateMilestoneModal';

interface AddMilestoneProps {
  goal?: Goal;
  className?: string;
}

export default function AddMilestone({ goal, className = '' }: AddMilestoneProps) {
  const { showModal } = useModal();

  const handleAddMilestone = () => {
    showModal({
      title: 'Create New Milestone',
      content: <CreateMilestoneModal goal={goal} />
    });
  };

  return (
    <button
      onClick={handleAddMilestone}
      className={`app-button ${className}`}
      aria-label="Create new milestone"
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
      Add Milestone
    </button>
  );
}
