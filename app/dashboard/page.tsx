import GoalsList from '@/app/components/GoalsList';
import ProgressChart from '@/app/components/ProgressChart';
import MilestoneTimeline from '@/app/components/MilestoneTimeline';
import CreateGoalModal from '@/app/components/CreateGoalModal';
import GoalSuggestions from '@/app/components/GoalSuggestions';
import { BarChart3, Target, Flag } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Goal, Milestone } from '@/app/types';

export const runtime = 'edge';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return null; // or redirect to login
  }

  const [goalsRes, milestonesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/goals`, {
      headers: {
        'X-User-Id': userId,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    }),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/milestones`, {
      headers: {
        'X-User-Id': userId,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })
  ]);

  const [goalsData, milestonesData] = await Promise.all([
    goalsRes.json(),
    milestonesRes.json()
  ]);

  const goals = Array.isArray(goalsData) ? goalsData : [];
  const milestones = Array.isArray(milestonesData) ? milestonesData : [];

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const nearCompletionGoals = activeGoals.filter(goal => goal.progress >= 75);
  const upcomingMilestones = milestones.filter(m => !m.completed);
  const overallProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5" />
              <h3 className="font-medium">Active Goals</h3>
            </div>
            <p className="text-3xl font-bold">{activeGoals.length}</p>
            <p className="text-indigo-100 text-sm mt-1">{nearCompletionGoals.length} goals near completion</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Flag className="w-5 h-5" />
              <h3 className="font-medium">Milestones</h3>
            </div>
            <p className="text-3xl font-bold">{milestones.length}</p>
            <p className="text-emerald-100 text-sm mt-1">{upcomingMilestones.length} upcoming</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5" />
              <h3 className="font-medium">Overall Progress</h3>
            </div>
            <p className="text-3xl font-bold">{overallProgress}%</p>
            <p className="text-violet-100 text-sm mt-1">Average completion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Goals</h2>
                <CreateGoalModal />
              </div>
              <GoalsList goals={goals} />
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Overview</h2>
              <ProgressChart />
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Suggestions</h2>
              <GoalSuggestions />
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Milestones Timeline</h2>
              <MilestoneTimeline />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
