'use client';

import { useState } from 'react';
import { Goal } from '@/app/types';
import GoalActions from './GoalActions';
import EditGoalDialog from './EditGoalDialog';
import { Progress } from '@/components/ui/progress';

interface GoalsListProps {
  goals: Goal[];
}

export default function GoalsList({ goals }: GoalsListProps) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleEdit = async (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleDelete = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      // Refresh the page or update the goals list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{goal.title}</h3>
              <p className="text-sm text-gray-500">{goal.description}</p>
            </div>
            <GoalActions
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          <div className="mt-4">
            <Progress value={goal.progress} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-sm text-gray-500">{goal.category}</span>
              <span className="text-sm text-gray-500">{goal.progress}%</span>
            </div>
          </div>
        </div>
      ))}

      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}
    </div>
  );
}
