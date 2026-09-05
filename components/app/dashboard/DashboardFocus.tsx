'use client';

import Link from 'next/link';
import type { CheckIn, Goal, Milestone, Todo } from '@/app/types';
import { calculateGoalProgress } from '@/lib/domain/progress';

export const CHECK_IN_STALE_DAYS = 7;

function dateValue(value: string) {
  return new Date(`${value}T23:59:59.999Z`).getTime();
}

function progressForGoal(goal: Goal, milestones: Milestone[], todos: Todo[]) {
  const goalMilestones = milestones.filter((milestone) => milestone.goalId === goal.id);
  const goalTodos = todos.filter((todo) => todo.goalId === goal.id);
  return calculateGoalProgress(goalMilestones.map((milestone) => {
    const tasks = goalTodos.filter((todo) => todo.milestoneId === milestone.id);
    return {
      completed: milestone.completed,
      tasksCompleted: tasks.filter((task) => task.completed).length,
      tasksTotal: tasks.length,
    };
  }), goal.status);
}

export default function DashboardFocus({ goals, milestones, todos, checkIns, asOf }: { goals: Goal[]; milestones: Milestone[]; todos: Todo[]; checkIns: CheckIn[]; asOf: number }) {
  const activeGoals = goals.filter((goal) => goal.status !== 'completed');
  const now = asOf;
  const focusTasks = todos
    .filter((todo) => !todo.completed && (!todo.dueDate || dateValue(todo.dueDate) < now + 7 * 86400000))
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    .slice(0, 5);
  const checkInNeeded = activeGoals.filter((goal) => {
    const latest = checkIns.filter((checkIn) => checkIn.goalId === goal.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    return !latest || now - dateValue(latest.date) > CHECK_IN_STALE_DAYS * 86400000;
  }).slice(0, 4);

  return <section className="surface-panel p-6">
    <div className="mb-5"><p className="page-kicker">Today</p><h2 className="text-xl font-semibold text-white">What needs your attention?</h2></div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div><h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Focus</h3>{focusTasks.length ? <ul className="mt-3 space-y-3">{focusTasks.map((todo) => <li key={todo.id}><Link href="/todos" className="block rounded-[16px] border border-white/10 p-3 hover:border-[rgba(93,166,255,0.35)]"><p className="break-words text-sm font-medium text-white">{todo.title}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{todo.dueDate ? (dateValue(todo.dueDate) < now ? 'Overdue' : `Due ${todo.dueDate}`) : 'No due date'}</p></Link></li>)}</ul> : <p className="mt-3 text-sm text-[var(--text-secondary)]">No urgent tasks. Choose the next action from an active goal.</p>}</div>
      <div><h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Active goals</h3>{activeGoals.length ? <ul className="mt-3 space-y-3">{activeGoals.slice(0, 4).map((goal) => <li key={goal.id}><Link href={`/goals/${goal.id}`} className="block rounded-[16px] border border-white/10 p-3 hover:border-[rgba(93,166,255,0.35)]"><div className="flex justify-between gap-3"><p className="break-words text-sm font-medium text-white">{goal.title}</p><span className="text-xs font-semibold text-[var(--accent)]">{progressForGoal(goal, milestones, todos)}%</span></div><div className="progress-track mt-2"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progressForGoal(goal, milestones, todos)}%` }} /></div></Link></li>)}</ul> : <p className="mt-3 text-sm text-[var(--text-secondary)]">Create a goal to turn a long-term outcome into weekly actions.</p>}</div>
      <div><h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Check-in needed</h3>{checkInNeeded.length ? <ul className="mt-3 space-y-3">{checkInNeeded.map((goal) => <li key={goal.id}><Link href={`/goals/${goal.id}`} className="block rounded-[16px] border border-white/10 p-3 hover:border-[rgba(93,166,255,0.35)]"><p className="break-words text-sm font-medium text-white">{goal.title}</p><p className="mt-1 text-xs text-[var(--text-muted)]">Review progress and choose the next focus.</p></Link></li>)}</ul> : <p className="mt-3 text-sm text-[var(--text-secondary)]">Your active goals have recent check-ins.</p>}</div>
    </div>
  </section>;
}
