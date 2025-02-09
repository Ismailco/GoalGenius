'use client';

import { useEffect, useState } from 'react';
import { Goal, GoalCategory, TimeFrame } from '@/app/types';
import { getGoals, updateGoal, deleteGoal } from '@/app/lib/storage';
import AlertModal from './AlertModal';

export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  // const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirmation?: boolean;
    onConfirm?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    setGoals(getGoals());
    setLoading(false);
  }, []);

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    try {
      await updateGoal(goalId, { progress });
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const handleDeleteGoal = (id: string) => {
    setAlert({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this goal?',
      type: 'warning',
      isConfirmation: true,
      onConfirm: () => {
        try {
          deleteGoal(id);
          setGoals(getGoals());
        } catch (error) {
          console.error('Error deleting goal:', error);
          setAlert({
            show: true,
            title: 'Error',
            message: 'Failed to delete goal',
            type: 'error'
          });
        }
      }
    });
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    try {
      updateGoal(id, updates);
      setGoals(getGoals());
      setEditingGoal(null);
    } catch (error) {
      console.error('Error updating goal:', error);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to update goal',
        type: 'error'
      });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading goals...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-gray-400">No goals yet. Add your first goal!</p>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200 border border-white/10"
            >
              {editingGoal?.id === goal.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingGoal.title}
                    onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <textarea
                    value={editingGoal.description}
                    onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <select
                    value={editingGoal.category}
                    onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value as GoalCategory })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="health">Health</option>
                    <option value="career">Career</option>
                    <option value="learning">Learning</option>
                    <option value="relationships">Relationships</option>
                  </select>
                  <select
                    value={editingGoal.timeFrame}
                    onChange={(e) => setEditingGoal({ ...editingGoal, timeFrame: e.target.value as TimeFrame })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="short-term">Short Term</option>
                    <option value="medium-term">Medium Term</option>
                    <option value="long-term">Long Term</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingGoal(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateGoal(goal.id, editingGoal)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{goal.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10">
                        {goal.category}
                      </span>
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-2">{goal.description}</p>
                  <div className="mt-4">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-400">{goal.timeFrame}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={goal.progress}
                        onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                        className="w-16 text-sm text-gray-300 bg-white/10 border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {alert.show && (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          isConfirmation={alert.isConfirmation}
          onConfirm={alert.onConfirm}
        />
      )}
    </>
  );
}
