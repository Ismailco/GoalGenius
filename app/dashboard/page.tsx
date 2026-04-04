'use client';

import { useEffect, useState } from 'react';
import { getGoals, getNotes, getTodos, getCheckIns } from '@/lib/storage';
// import { Note, Todo, CheckIn } from '@/app/types';
import GoalsList from '@/components/app/dashboard/GoalsList';
import ProgressChart from '@/components/app/dashboard/ProgressChart';
import MilestoneTimeline from '@/components/app/dashboard/MilestoneTimeline';
import CreateGoalModal from '@/components/app/dashboard/CreateGoalModal';
import GoalSuggestions from '@/components/app/dashboard/GoalSuggestions';
import DashboardCard from '@/components/app/dashboard/DashboardCard';
import SectionHeader from '@/components/app/dashboard/SectionHeader';
import DashboardSection from '@/components/app/dashboard/DashboardSection';
import AddMilestone from '@/components/app/milestones/AddMilestone';
import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalGoals: 0,
    averageProgress: 0,
    completedMilestones: 0,
    totalNotes: 0,
    activeTodos: 0,
    completedTodos: 0,
    lastCheckIn: null as string | null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setMounted(true);
        const [goals, notes, todos, checkIns] = await Promise.all([
          getGoals(),
          getNotes(),
          getTodos(),
          getCheckIns()
        ]);

        const activeTodosCount = todos.filter(todo => !todo.completed).length;
        const completedTodosCount = todos.filter(todo => todo.completed).length;
        const lastCheckIn = checkIns.length > 0
          ? new Date(checkIns[checkIns.length - 1].createdAt).toLocaleDateString()
          : null;

        setStats({
          totalGoals: goals.length,
          averageProgress: goals.length > 0
            ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
            : 0,
          completedMilestones: goals.filter(goal => goal.progress === 100).length,
          totalNotes: notes.length,
          activeTodos: activeTodosCount,
          completedTodos: completedTodosCount,
          lastCheckIn,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    }

    fetchData();
  }, []);

  if (!mounted) {
    return (
      <AppPage>
        <div className="page-skeleton animate-pulse p-6">
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="mt-4 h-10 w-3/5 rounded-2xl bg-white/10" />
          <div className="mt-3 h-4 w-2/5 rounded-full bg-white/5" />
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Overview"
        title="Your progress at a glance"
        description="A quieter, more structured dashboard for goals, notes, check-ins, and next actions."
        meta={
          <>
            <span className="app-pill app-pill-blue">
              {stats.totalGoals} goals in focus
            </span>
            <span className="app-pill app-pill-success">
              {stats.completedTodos} tasks completed
            </span>
            <span className="app-pill app-pill-warning">
              {stats.lastCheckIn || 'No recent check-in'}
            </span>
          </>
        }
        action={
          <>
            <GoalSuggestions />
            <CreateGoalModal />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard
          title="Total Goals"
          value={stats.totalGoals}
          subtitle="Current goals across your workspace"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <DashboardCard
          title="Progress"
          value={`${stats.averageProgress}%`}
          subtitle="Average completion across active goals"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <DashboardCard
          title="Milestones"
          value={stats.completedMilestones}
          subtitle="Goals already completed"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard
          title="Notes"
          value={stats.totalNotes}
          subtitle="Notes captured for future reference"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
        <DashboardCard
          title="Todo Tasks"
          value={stats.activeTodos}
          subtitle={`${stats.completedTodos} already completed`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <DashboardCard
          title="Last Check-in"
          value={stats.lastCheckIn || 'No check-ins'}
          subtitle="Most recent reflection saved"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection>
          <SectionHeader
            title="Current Goals"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <GoalsList />
        </DashboardSection>

        <DashboardSection>
          <SectionHeader
            title="Progress Overview"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <ProgressChart />
        </DashboardSection>
      </div>

      <DashboardSection>
        <SectionHeader
          title="Milestones Timeline"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          action={<AddMilestone />}
        />
        <MilestoneTimeline />
      </DashboardSection>
    </AppPage>
  );
}
