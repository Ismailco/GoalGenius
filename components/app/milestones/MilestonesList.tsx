'use client';

import { useState, useEffect } from 'react';
import { Milestone, Goal, Todo } from '@/app/types';
import { getMilestones, getGoals, getTodos, deleteMilestone } from '@/lib/storage';
import { calculateGoalProgress } from '@/lib/domain/progress';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ChevronDown, ChevronUp, Calendar, Trash, Edit } from 'lucide-react';
import AlertModal from '@/components/common/AlertModal';
import { useModal } from '@/app/providers/ModalProvider';
import EditMilestoneModal from './EditMilestoneModal';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';
import { formatDateOnly, todayDateOnly } from '@/lib/domain/date-only';

interface MilestonesListProps {
  searchTerm: string;
  timeframe: 'all' | 'upcoming' | 'past' | 'today';
}

export default function MilestonesList({ searchTerm, timeframe }: MilestonesListProps) {
  const { showModal } = useModal();
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
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

  const loadData = async () => {
    await handleAsyncOperation(
      async () => {
        const [loadedMilestones, loadedGoals, loadedTodos] = await Promise.all([
          getMilestones(),
          getGoals(),
          getTodos(),
        ]);
        setMilestones(loadedMilestones);
        setGoals(loadedGoals);
        setTodos(loadedTodos);
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

  useEffect(() => {
    loadData();
    const handleWorkspaceSync = () => {
      void loadData();
    };

    window.addEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);

    return () => {
      window.removeEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
    };
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
      message: 'The milestone will be deleted; its tasks will remain linked to the goal. Continue?',
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

    const today = todayDateOnly();

    switch (timeframe) {
      case 'upcoming':
        return milestone.date > today;
      case 'past':
        return milestone.date < today;
      case 'today':
        return milestone.date === today;
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
    <div className="space-y-4 p-4 md:p-6">
      {filteredGoals.map(goal => {
        const goalTodos = todos.filter((todo) => todo.goalId === goal.id);
        const progress = calculateGoalProgress(milestones.filter((milestone) => milestone.goalId === goal.id).map((milestone) => {
          const milestoneTodos = goalTodos.filter((todo) => todo.milestoneId === milestone.id);
          return { completed: milestone.completed, tasksCompleted: milestoneTodos.filter((todo) => todo.completed).length, tasksTotal: milestoneTodos.length };
        }), goal.status);
        const goalMilestones = milestones
          .filter(m => m.goalId === goal.id && filterMilestones(m))
          .sort((a, b) => a.date.localeCompare(b.date));

        return (
          <div
            key={goal.id}
            className="surface-card overflow-hidden"
          >
            <button
              onClick={() => toggleGoal(goal.id)}
              className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  progress === 100 ? 'bg-green-500' :
                  progress >= 50 ? 'bg-blue-500' :
                  'bg-slate-400'
                }`} />
                <div>
                  <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{goalMilestones.length} milestone{goalMilestones.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              {expandedGoals.has(goal.id) ? (
                <ChevronUp className="w-5 h-5 text-[var(--text-secondary)]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
              )}
            </button>

            {expandedGoals.has(goal.id) && (
              <div className="px-6 pb-4 space-y-3">
                {goalMilestones.length === 0 ? (
                  <p className="py-4 text-center text-[var(--text-secondary)]">No milestones found</p>
                ) : (
                  goalMilestones.map(milestone => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between rounded-[18px] border border-white/10 bg-[rgba(8,17,30,0.52)] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[var(--accent)]" />
                        <div>
                          <h4 className="text-white font-medium">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-[var(--text-secondary)]">{milestone.description}</p>
                          )}
                          <p className="text-xs text-[var(--text-muted)]">Due: {formatDateOnly(milestone.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMilestone(milestone);
                          }}
                          className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                          aria-label="Edit milestone"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMilestone(milestone.id);
                          }}
                          className="rounded-full p-2 text-[var(--text-secondary)] hover:bg-[rgba(255,111,130,0.12)] hover:text-[rgb(255,220,226)]"
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
        <div className="surface-empty py-8 text-center">
          <p className="text-lg">
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
