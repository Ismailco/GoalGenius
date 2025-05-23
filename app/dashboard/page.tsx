'use client';

import { useEffect, useState } from 'react';
import { getGoals, getNotes, getTodos, getCheckIns } from '@/lib/storage';
// import { Note, Todo, CheckIn } from '@/app/types';
import GoalsList from '@/components/app/dashboard/GoalsList';
import ProgressChart from '@/components/app/dashboard/ProgressChart';
import MilestoneTimeline from '@/components/app/dashboard/MilestoneTimeline';
import CreateGoalModal from '@/components/app/dashboard/CreateGoalModal';
import GoalSuggestions from '@/components/app/dashboard/GoalSuggestions';
import { useModal } from '@/app/providers/ModalProvider';
import DashboardCard from '@/components/app/dashboard/DashboardCard';
import SectionHeader from '@/components/app/dashboard/SectionHeader';
import DashboardSection from '@/components/app/dashboard/DashboardSection';
import AddMilestone from '@/components/app/milestones/AddMilestone';

export default function DashboardPage() {
  const { showModal } = useModal();
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
      <div className="relative">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded-xl w-3/4"></div>
          <div className="h-4 bg-white/5 rounded-xl w-1/2 mt-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header Section */}
      <DashboardSection className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Your Journey Dashboard
            </h1>
            <p className="text-gray-300 mt-2">Track your progress, achieve your dreams</p>
          </div>
          <div className="flex gap-4">
            <GoalSuggestions />
            <CreateGoalModal />
          </div>
        </div>
      </DashboardSection>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DashboardCard
          title="Total Goals"
          value={stats.totalGoals}
          subtitle="Active goals this month"
          icon={
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <DashboardCard
          title="Progress"
          value={`${stats.averageProgress}%`}
          subtitle="Average completion rate"
          icon={
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <DashboardCard
          title="Milestones"
          value={stats.completedMilestones}
          subtitle="Completed goals"
          icon={
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <DashboardCard
          title="Notes"
          value={stats.totalNotes}
          subtitle="Total notes created"
          icon={
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
        <DashboardCard
          title="Todo Tasks"
          value={stats.activeTodos}
          subtitle={`${stats.completedTodos} tasks completed`}
          icon={
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <DashboardCard
          title="Last Check-in"
          value={stats.lastCheckIn || 'No check-ins'}
          subtitle="Latest activity recorded"
          icon={
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection>
          <SectionHeader
            title="Current Goals"
            icon={
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <ProgressChart />
        </DashboardSection>
      </div>

      {/* Timeline Section */}
      <DashboardSection className="mt-6">
        <SectionHeader
          title="Milestones Timeline"
          icon={
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          action={<AddMilestone />}
        />
        <MilestoneTimeline />
      </DashboardSection>
    </div>
  );
}
