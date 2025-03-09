'use client';

import { useEffect, useState } from 'react';
import { getGoals } from '@/app/lib/storage';
import GoalsList from '@/app/components/GoalsList';
import ProgressChart from '@/app/components/ProgressChart';
import MilestoneTimeline from '@/app/components/MilestoneTimeline';
import CreateGoalModal from '@/app/components/CreateGoalModal';
import GoalSuggestions from '@/app/components/GoalSuggestions';
import CreateMilestoneModal from '@/app/components/CreateMilestoneModal';
import { useModal } from '@/app/providers/ModalProvider';
import DashboardCard from '@/app/components/DashboardCard';
import SectionHeader from '@/app/components/SectionHeader';
import DashboardSection from '@/app/components/DashboardSection';

export default function DashboardPage() {

  const { showModal } = useModal();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalGoals: 0,
    averageProgress: 0,
    completedMilestones: 0
  });

  useEffect(() => {
    setMounted(true);
    const goals = getGoals();
    setStats({
      totalGoals: goals.length,
      averageProgress: goals.length > 0
        ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
        : 0,
      completedMilestones: goals.filter(goal => goal.progress === 100).length
    });
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
          action={
            <button
              onClick={() => showModal({
                title: 'Add Milestone',
                content: <CreateMilestoneModal />
              })}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Milestone
            </button>
          }
        />
        <MilestoneTimeline />
      </DashboardSection>
    </div>
  );
}
