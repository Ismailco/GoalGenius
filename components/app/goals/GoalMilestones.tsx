'use client';

import { Circle, CircleCheck, Plus } from 'lucide-react';
import type { Goal, Milestone } from '@/app/types';
import type { MilestoneTaskCount } from '@/lib/domain/goals';
import AddMilestone from '@/components/app/milestones/AddMilestone';
import EditMilestoneModal from '@/components/app/milestones/EditMilestoneModal';
import OverflowMenu from '@/components/app/shared/OverflowMenu';
import { useModal } from '@/app/providers/ModalProvider';
import { formatDateOnly } from '@/lib/domain/date-only';

interface GoalMilestonesProps {
  goal: Goal;
  milestones: Milestone[];
  onAddTask: (milestoneId: string) => void;
  onCreated: () => void | Promise<void>;
  onToggle: (milestone: Milestone) => void;
  onUpdated: (milestone: Milestone) => void | Promise<void>;
  pendingMilestoneId: string | null;
  nextMilestoneId: string | null;
  taskCounts: Map<string, MilestoneTaskCount>;
  today: string;
}

function MilestoneActions({ milestone, onUpdated }: { milestone: Milestone; onUpdated: (milestone: Milestone) => void | Promise<void> }) {
  const { showModal } = useModal();

  return (
    <OverflowMenu ariaLabel={`Actions for ${milestone.title}`}>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
        onClick={() => showModal({
          title: `Edit ${milestone.title}`,
          content: <EditMilestoneModal milestone={milestone} onUpdate={onUpdated} />,
        })}
      >
        Edit milestone
      </button>
    </OverflowMenu>
  );
}

export default function GoalMilestones({ goal, milestones, onAddTask, onCreated, onToggle, onUpdated, pendingMilestoneId, nextMilestoneId, taskCounts, today }: GoalMilestonesProps) {
  return (
    <section aria-labelledby="goal-milestones-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="goal-milestones-heading" className="text-lg font-semibold text-[var(--text-primary)]">Milestones</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">The roadmap underneath this outcome.</p>
        </div>
        <AddMilestone goal={goal} label="Add milestone" className="app-button-secondary app-button-sm" onCreated={onCreated} />
      </div>

      {milestones.length === 0 ? (
        <div className="app-empty-state mt-4 px-5 py-6">
          <p className="font-medium text-[var(--text-primary)]">No milestones yet</p>
          <p className="mt-1 text-sm">Break this goal into major checkpoints.</p>
          <AddMilestone goal={goal} label="Add milestone" className="app-button mt-4" onCreated={onCreated} />
        </div>
      ) : (
        <div className="mt-3 border-y border-[var(--border-default)]">
          {milestones.map((milestone) => {
            const count = taskCounts.get(milestone.id) ?? { completed: 0, total: 0 };
            const isOverdue = !milestone.completed && milestone.date < today;
            return (
              <div key={milestone.id} className="flex items-start gap-3 border-b border-[var(--border-subtle)] py-4 last:border-b-0">
                <button
                  type="button"
                  className="mt-0.5 shrink-0 rounded-md text-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => onToggle(milestone)}
                  disabled={pendingMilestoneId === milestone.id}
                  aria-label={`${milestone.completed ? 'Mark' : 'Mark'} ${milestone.title} ${milestone.completed ? 'incomplete' : 'complete'}`}
                >
                  {milestone.completed ? <CircleCheck className="h-5 w-5" aria-hidden="true" /> : <Circle className="h-5 w-5" aria-hidden="true" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className={`break-words text-sm font-medium ${milestone.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>{milestone.title}</p>
                    {nextMilestoneId === milestone.id ? <span className="text-xs font-medium text-[var(--brand-primary)]">Next</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {count.total > 0 ? `${count.completed} of ${count.total} tasks` : 'No tasks'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <div className="hidden text-right text-xs sm:block">
                    <p className={isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}>
                      {formatDateOnly(milestone.date, { month: 'short', day: 'numeric', year: milestone.date.slice(0, 4) !== today.slice(0, 4) ? 'numeric' : undefined })}
                    </p>
                    {isOverdue ? <p className="text-[var(--danger)]">Overdue</p> : null}
                  </div>
                  <button type="button" className="app-button-ghost app-button-sm" onClick={() => onAddTask(milestone.id)}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Add task</span>
                    <span className="sr-only sm:hidden">Add task</span>
                  </button>
                  <MilestoneActions milestone={milestone} onUpdated={onUpdated} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
