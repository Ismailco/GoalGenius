'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import type { CheckIn, Goal, Milestone, Todo } from '@/app/types';
import AddMilestone from '@/components/app/milestones/AddMilestone';
import EditGoalModal from '@/components/app/goals/EditGoalModal';
import CreateCheckInModal from '@/components/app/checkins/CreateCheckInModal';
import CreateTodoModal from '@/components/app/todos/CreateTodoModal';
import { AppPage } from '@/components/app/shared/AppPage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getCheckIns, getGoal, getMilestones, getTodos, toggleTodoComplete, updateMilestone } from '@/lib/storage';
import { calculateGoalProgress } from '@/lib/domain/progress';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';
import { GoalCheckInList, GoalMilestoneList, GoalTaskList, formatGoalDate } from './GoalExecutionParts';

export default function GoalExecutionView({ goalId }: { goalId: string }) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [nextGoal, nextMilestones, nextTodos, nextCheckIns] = await Promise.all([
        getGoal(goalId), getMilestones(), getTodos(), getCheckIns(),
      ]);
      setGoal(nextGoal);
      setMilestones(nextMilestones.filter((item) => item.goalId === goalId));
      setTodos(nextTodos.filter((item) => item.goalId === goalId));
      setCheckIns(nextCheckIns.filter((item) => item.goalId === goalId).sort((a, b) => b.date.localeCompare(a.date)));
    } catch {
      setError('This goal could not be loaded. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [goalId]);

  useEffect(() => {
    void load();
    const handleSync = () => void load();
    window.addEventListener(WORKSPACE_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(WORKSPACE_SYNC_EVENT, handleSync);
  }, [load]);

  const progress = useMemo(() => calculateGoalProgress(milestones.map((milestone) => {
    const milestoneTasks = todos.filter((todo) => todo.milestoneId === milestone.id);
    return { completed: milestone.completed, tasksCompleted: milestoneTasks.filter((todo) => todo.completed).length, tasksTotal: milestoneTasks.length };
  }), goal?.status), [goal?.status, milestones, todos]);

  async function handleToggleTask(todo: Todo) {
    setPendingId(todo.id);
    try { await toggleTodoComplete(todo.id); await load(); } catch { setError('The task could not be updated. Please try again.'); } finally { setPendingId(null); }
  }

  async function handleToggleMilestone(milestone: Milestone) {
    setPendingId(milestone.id);
    try { await updateMilestone(milestone.id, { completed: !milestone.completed }); await load(); } catch { setError('The milestone could not be updated. Please try again.'); } finally { setPendingId(null); }
  }

  if (loading) return <AppPage><div className="surface-panel flex justify-center p-12"><LoadingSpinner size="large" /></div></AppPage>;
  if (error && !goal) return <AppPage><div className="surface-empty p-10 text-center"><h1 className="text-xl font-semibold text-white">Unable to load goal</h1><p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p><button type="button" className="app-button mt-5" onClick={() => void load()}>Try again</button></div></AppPage>;
  if (!goal) return <AppPage><div className="surface-empty p-10 text-center"><h1 className="text-xl font-semibold text-white">Goal not found</h1><Link className="app-button mt-5 inline-flex" href="/goals">Back to goals</Link></div></AppPage>;

  const lastCheckIn = checkIns[0];
  const openTaskModal = (milestoneId?: string | null) => { setSelectedMilestoneId(milestoneId ?? null); setIsTaskOpen(true); };

  return <AppPage>
    <div className="flex justify-end"><EditGoalModal goal={goal} /></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/goals" className="app-button-secondary"><ArrowLeft className="h-4 w-4" /> All goals</Link><button type="button" onClick={() => void load()} className="app-button-secondary" disabled={refreshing} aria-label="Refresh goal"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button></div>
    {error ? <div className="rounded-[18px] border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100" role="alert">{error}</div> : null}
    <section className="surface-panel page-hero"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><p className="page-kicker">{goal.category} · {goal.timeFrame}</p><h1 className="page-title break-words">{goal.title}</h1><p className="page-description">{goal.description || 'Turn this outcome into a small set of actions you can complete this week.'}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setIsCheckInOpen(true)} className="app-button"><Plus className="h-4 w-4" /> Check-in</button><button type="button" onClick={() => openTaskModal(null)} className="app-button-secondary"><Plus className="h-4 w-4" /> Task</button><AddMilestone goal={goal} /></div></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><div className="surface-card-compact"><p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Progress</p><p className="mt-2 text-3xl font-bold text-white">{progress}%</p><div className="progress-track mt-3"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} /></div></div><div className="surface-card-compact"><p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Target date</p><p className="mt-2 break-words text-lg font-semibold text-white">{formatGoalDate(goal.dueDate)}</p></div><div className="surface-card-compact"><p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Last check-in</p><p className="mt-2 text-lg font-semibold text-white">{lastCheckIn ? formatGoalDate(lastCheckIn.date) : 'Not yet'}</p></div></div></section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"><GoalTaskList todos={todos} milestones={milestones} pendingId={pendingId} onToggle={handleToggleTask} onAdd={openTaskModal} /><GoalMilestoneList goal={goal} milestones={milestones} todos={todos} pendingId={pendingId} onToggle={handleToggleMilestone} onAddTask={openTaskModal} /></div>
    <GoalCheckInList checkIns={checkIns} />
    {isTaskOpen ? <CreateTodoModal isOpen={isTaskOpen} onClose={() => { setIsTaskOpen(false); void load(); }} goalId={goal.id} milestoneId={selectedMilestoneId} onSave={() => void load()} /> : null}
    {isCheckInOpen ? <CreateCheckInModal isOpen={isCheckInOpen} onClose={() => { setIsCheckInOpen(false); void load(); }} goalId={goal.id} onSave={() => void load()} /> : null}
  </AppPage>;
}
