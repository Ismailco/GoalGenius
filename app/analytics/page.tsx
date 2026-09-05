import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';

export default function AnalyticsPage() {
  return <AppPage><AppPageHeader eyebrow="Analytics" title="Analytics is not part of this beta" description="GoalGenius is currently focused on the execution loop: goals, milestones, tasks, and check-ins." /><section className="surface-panel p-8 text-center"><h2 className="text-xl font-semibold text-white">Keep the review close to the work</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Use each goal page to review progress and adjust the plan. Broader reporting will be considered after the core workflow has enough real history.</p></section></AppPage>;
}
