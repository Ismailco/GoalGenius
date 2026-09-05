'use client';

import { Check, Circle, Plus } from 'lucide-react';
import type { CheckIn, Goal, Milestone, Todo } from '@/app/types';
import AddMilestone from '@/components/app/milestones/AddMilestone';
import { calculateMilestoneProgress } from '@/lib/domain/progress';
import { formatDateOnly } from '@/lib/domain/date-only';

export function formatGoalDate(value?: string | null) {
  if (!value) return 'No date set';
  return formatDateOnly(value);
}

function arrayValue(value: string[] | string | undefined) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface GoalTaskListProps {
  milestones: Milestone[];
  onAdd: (milestoneId?: string | null) => void;
  onToggle: (todo: Todo) => void;
  pendingId: string | null;
  todos: Todo[];
}

export function GoalTaskList({ milestones, onAdd, onToggle, pendingId, todos }: GoalTaskListProps) {
  return (
    <section className="surface-panel p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div><p className="page-kicker">Execution</p><h2 className="text-xl font-semibold text-white">Next actions</h2></div>
        <span className="app-pill app-pill-blue">{todos.filter((todo) => todo.completed).length}/{todos.length} complete</span>
      </div>
      {todos.length === 0 ? (
        <div className="surface-empty p-6">
          <p className="font-semibold text-white">Start with one action</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Tasks make a milestone executable. Add the smallest useful next step.</p>
          <button type="button" onClick={() => onAdd(null)} className="app-button mt-4"><Plus className="h-4 w-4" /> Add first task</button>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-[rgba(8,17,30,0.42)] p-4">
              <button type="button" onClick={() => onToggle(todo)} disabled={pendingId === todo.id} className="mt-0.5 rounded-md text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50" aria-label={`${todo.completed ? 'Reopen' : 'Complete'} task ${todo.title}`}>
                {todo.completed ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`break-words font-medium ${todo.completed ? 'text-[var(--text-muted)] line-through' : 'text-white'}`}>{todo.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{todo.milestoneId ? milestones.find((milestone) => milestone.id === todo.milestoneId)?.title : 'Goal task'}{todo.dueDate ? ` · Due ${formatGoalDate(todo.dueDate)}` : ''}{todo.recurrence && todo.recurrence !== 'none' ? ` · ${todo.recurrence}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface GoalMilestoneListProps {
  goal: Goal;
  milestones: Milestone[];
  onAddTask: (milestoneId: string) => void;
  onToggle: (milestone: Milestone) => void;
  pendingId: string | null;
  todos: Todo[];
}

export function GoalMilestoneList({ goal, milestones, onAddTask, onToggle, pendingId, todos }: GoalMilestoneListProps) {
  return (
    <section className="surface-panel p-6">
      <div className="mb-5 flex items-center justify-between gap-3"><div><p className="page-kicker">Plan</p><h2 className="text-xl font-semibold text-white">Milestones</h2></div><AddMilestone goal={goal} className="!px-3 !py-2 text-sm" /></div>
      {milestones.length === 0 ? <div className="surface-empty p-6"><p className="font-semibold text-white">Define the first checkpoint</p><p className="mt-2 text-sm text-[var(--text-secondary)]">Milestones turn a distant goal into a path you can review.</p></div> : <div className="space-y-3">{milestones.map((milestone) => { const milestoneTasks = todos.filter((todo) => todo.milestoneId === milestone.id); const progress = calculateMilestoneProgress({ completed: milestone.completed, tasksCompleted: milestoneTasks.filter((todo) => todo.completed).length, tasksTotal: milestoneTasks.length }); return <div key={milestone.id} className="rounded-[18px] border border-white/10 p-4"><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => onToggle(milestone)} disabled={pendingId === milestone.id} className="flex min-w-0 items-start gap-3 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"><span className="mt-0.5 text-[var(--accent)]">{milestone.completed ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}</span><span><span className={`block break-words font-medium ${milestone.completed ? 'text-[var(--text-muted)] line-through' : 'text-white'}`}>{milestone.title}</span><span className="mt-1 block text-xs text-[var(--text-muted)]">Due {formatGoalDate(milestone.date)}</span></span></button><div className="flex shrink-0 items-center gap-2"><span className="app-pill app-pill-blue">{progress}%</span><button type="button" onClick={() => onAddTask(milestone.id)} className="app-button-secondary !px-2 !py-1 text-xs"><Plus className="h-3 w-3" /> Task</button></div></div><div className="progress-track mt-3"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} /></div></div>; })}</div>}
    </section>
  );
}

export function GoalCheckInList({ checkIns }: { checkIns: CheckIn[] }) {
  return <section className="surface-panel p-6"><div className="mb-5"><p className="page-kicker">Review</p><h2 className="text-xl font-semibold text-white">Recent check-ins</h2></div>{checkIns.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No check-in for this goal yet. Record progress, blockers, and your next focus after a work session.</p> : <div className="grid gap-3 md:grid-cols-2">{checkIns.slice(0, 4).map((checkIn) => <article key={checkIn.id} className="surface-card-compact"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-white">{formatGoalDate(checkIn.date)}</p><span className="text-sm capitalize text-[var(--text-secondary)]">{checkIn.mood} · {checkIn.energy} energy</span></div><div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]"><p><strong className="text-white">Progress:</strong> {arrayValue(checkIn.accomplishments).join(', ') || 'Nothing recorded.'}</p><p><strong className="text-white">Blockers:</strong> {arrayValue(checkIn.challenges).join(', ') || 'None recorded.'}</p><p><strong className="text-white">Next focus:</strong> {arrayValue(checkIn.goals).join(', ') || 'Not recorded.'}</p></div>{checkIn.notes ? <p className="mt-3 border-t border-white/10 pt-3 text-sm text-[var(--text-secondary)]">{checkIn.notes}</p> : null}</article>)}</div>}</section>;
}
