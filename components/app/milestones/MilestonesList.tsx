'use client';

import { useState, useEffect } from 'react';
import { Milestone, Goal } from '@/app/types';
import { getMilestones, getGoals, deleteMilestone } from '@/lib/storage';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ChevronDown, ChevronUp, Calendar, Trash, Edit } from 'lucide-react';
import AlertModal from '@/components/common/AlertModal';
import { useModal } from '@/app/providers/ModalProvider';
import EditMilestoneModal from './EditMilestoneModal';

interface MilestonesListProps {
  searchTerm: string;
  timeframe: 'all' | 'upcoming' | 'past' | 'today';
}

export default function MilestonesList({ searchTerm, timeframe }: MilestonesListProps) {
  const { showModal } = useModal();
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
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
    const loadData = async () => {
      await handleAsyncOperation(
        async () => {
          const [loadedMilestones, loadedGoals] = await Promise.all([
            getMilestones(),
            getGoals()
          ]);
          setMilestones(loadedMilestones);
          setGoals(loadedGoals);
        },
        setLoading,
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

    loadData();
  }, []);

  const toggleGoal = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    showModal({
      title: 'Edit Milestone',
      content: (
        <EditMilestoneModal
          milestone={milestone}
          onUpdate={(updatedMilestone) => {
            setMilestones(prev =>
              prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
            );
            setAlert({
              show: true,
              title: 'Success',
              message: 'Milestone updated successfully',
              type: 'success'
            });
          }}
        />
      )
    });
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    setAlert({
      show: true,
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this milestone?',
      type: 'warning',
      isConfirmation: true,
      onConfirm: async () => {
        await handleAsyncOperation(
          async () => {
            await deleteMilestone(milestoneId);
            setMilestones(prev => prev.filter(m => m.id !== milestoneId));
            setAlert({
              show: true,
              title: 'Success',
              message: 'Milestone deleted successfully',
              type: 'success'
            });
          },
          undefined,
          (error) => {
            setAlert({
              show: true,
              title: 'Error',
              message: getUserFriendlyErrorMessage(error),
              type: 'error'
            });
          }
        );
      }
    });
  };

  const filterMilestones = (milestone: Milestone) => {
    const matchesSearch = searchTerm === '' ||
      milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      milestone.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const milestoneDate = new Date(milestone.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (timeframe) {
      case 'upcoming':
        return milestoneDate > today;
      case 'past':
        return milestoneDate < today;
      case 'today':
        return milestoneDate.toDateString() === today.toDateString();
      default:
        return true;
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  const filteredGoals = goals.filter(goal => {
    const goalMilestones = milestones.filter(m => m.goalId === goal.id && filterMilestones(m));
    return goalMilestones.length > 0 || searchTerm === '';
  });

  return (
    <div className="space-y-4 p-6">
      {filteredGoals.map(goal => {
        const goalMilestones = milestones
          .filter(m => m.goalId === goal.id && filterMilestones(m))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return (
          <div
            key={goal.id}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleGoal(goal.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  goal.progress === 100 ? 'bg-green-500' :
                  goal.progress >= 50 ? 'bg-blue-500' :
                  'bg-purple-500'
                }`} />
                <div>
                  <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                  <p className="text-sm text-gray-400">{goalMilestones.length} milestone{goalMilestones.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {expandedGoals.has(goal.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedGoals.has(goal.id) && (
              <div className="px-6 pb-4 space-y-3">
                {goalMilestones.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No milestones found</p>
                ) : (
                  goalMilestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="text-white font-medium">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-gray-400">{milestone.description}</p>
                          )}
                          <p className="text-xs text-gray-500">Due: {new Date(milestone.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMilestone(milestone);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          aria-label="Edit milestone"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMilestone(milestone.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          aria-label="Delete milestone"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {filteredGoals.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg">
            {goals.length === 0 ? "No goals found. Create a goal first!" : "No milestones match your search criteria."}
          </p>
        </div>
      )}

      {alert.show && (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          isConfirmation={alert.isConfirmation}
          onConfirm={alert.onConfirm}
          onClose={() => setAlert({ ...alert, show: false })}
          aria-label={`${alert.type} alert: ${alert.title}`}
          role="alertdialog"
        />
      )}
    </div>
  );
}
