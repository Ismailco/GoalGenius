'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { CheckIn, Goal, Milestone, Todo } from '@/app/types';
import CreateGoalModal from '@/components/app/dashboard/CreateGoalModal';
import DashboardCard from '@/components/app/dashboard/DashboardCard';
import DashboardFocus from '@/components/app/dashboard/DashboardFocus';
import GoalSuggestions from '@/components/app/dashboard/GoalSuggestions';
import GoalsList from '@/components/app/dashboard/GoalsList';
import DashboardSection from '@/components/app/dashboard/DashboardSection';
import SectionHeader from '@/components/app/dashboard/SectionHeader';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';
import { getCheckIns, getGoals, getMilestones, getTodos } from '@/lib/storage';
import { calculateGoalProgress } from '@/lib/domain/progress';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';
import { formatDateOnly } from '@/lib/domain/date-only';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [asOf, setAsOf] = useState(0);
  const [stats, setStats] = useState({ totalGoals: 0, averageProgress: 0, completedTodos: 0, lastCheckIn: null as string | null });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [loadedGoals, loadedMilestones, loadedTodos, loadedCheckIns] = await Promise.all([getGoals(), getMilestones(), getTodos(), getCheckIns()]);
      setGoals(loadedGoals);
      setMilestones(loadedMilestones);
      setTodos(loadedTodos);
      setCheckIns(loadedCheckIns);
      setAsOf(Date.now());
      const recentCheckIn = [...loadedCheckIns].sort((a, b) => b.date.localeCompare(a.date))[0];
      setStats({
        totalGoals: loadedGoals.length,
        averageProgress: loadedGoals.length ? Math.round(loadedGoals.reduce((total, goal) => {
          const goalMilestones = loadedMilestones.filter((milestone) => milestone.goalId === goal.id);
          const goalTasks = loadedTodos.filter((todo) => todo.goalId === goal.id);
          return total + calculateGoalProgress(goalMilestones.map((milestone) => { const tasks = goalTasks.filter((todo) => todo.milestoneId === milestone.id); return { completed: milestone.completed, tasksCompleted: tasks.filter((task) => task.completed).length, tasksTotal: tasks.length }; }), goal.status);
        }, 0) / loadedGoals.length) : 0,
        completedTodos: loadedTodos.filter((todo) => todo.completed).length,
        lastCheckIn: recentCheckIn ? formatDateOnly(recentCheckIn.date) : null,
      });
    } catch {
      setError('The dashboard could not load your workspace. Try again.');
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const handleWorkspaceSync = () => void fetchData();
    window.addEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
    return () => window.removeEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
  }, [fetchData]);

  if (!mounted) return <AppPage><div className="page-skeleton animate-pulse p-6"><div className="h-3 w-28 rounded-full bg-white/10" /><div className="mt-4 h-10 w-3/5 rounded-2xl bg-white/10" /><div className="mt-3 h-4 w-2/5 rounded-full bg-white/5" /></div></AppPage>;

  return <AppPage>
    <AppPageHeader eyebrow="Overview" title="What should you work on next?" description="Turn long-term goals into weekly actions, then review what moved." meta={<><span className="app-pill app-pill-blue">{stats.totalGoals} goals in focus</span><span className="app-pill app-pill-success">{stats.completedTodos} tasks completed</span><span className="app-pill app-pill-warning">{stats.lastCheckIn || 'No recent check-in'}</span></>} action={<><GoalSuggestions /><CreateGoalModal /></>} />
    {error ? <div className="rounded-[18px] border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100" role="alert">{error} <button type="button" className="ml-2 underline" onClick={() => void fetchData()}>Try again</button></div> : null}
    {stats.totalGoals === 0 ? <section className="surface-panel p-6 md:p-8"><p className="page-kicker">First plan</p><h2 className="mt-2 text-2xl font-semibold text-white">Start with one meaningful goal</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Goals define where you want to go. Milestones define the major steps. Tasks define what you can do next. Create one goal, then add its first milestone and task from the goal page.</p><div className="mt-5 flex flex-wrap gap-3"><CreateGoalModal /><Link href="/docs" className="app-button-secondary">How the workflow works</Link></div></section> : <DashboardFocus goals={goals} milestones={milestones} todos={todos} checkIns={checkIns} asOf={asOf} />}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><DashboardCard title="Goals in focus" value={stats.totalGoals} subtitle="Choose a goal to turn into this week’s actions" icon={<span aria-hidden="true">◎</span>} /><DashboardCard title="Average progress" value={`${stats.averageProgress}%`} subtitle="Calculated from milestone and task completion" icon={<span aria-hidden="true">↗</span>} /><DashboardCard title="Completed tasks" value={stats.completedTodos} subtitle="Small actions already moved forward" icon={<span aria-hidden="true">✓</span>} /></div>
    <DashboardSection><SectionHeader title="Current Goals" icon={<span aria-hidden="true">◎</span>} /><GoalsList /></DashboardSection>
  </AppPage>;
}
