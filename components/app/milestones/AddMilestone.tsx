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
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 ${className}`}
      aria-label="Create new milestone"
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
      Add Milestone
    </button>
  );
}
