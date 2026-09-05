import { AppPage, AppPageHeader } from '@/components/app/shared/AppPage';

export default function CalendarPage() {
  return <AppPage><AppPageHeader eyebrow="Calendar" title="Calendar is not part of this beta" description="Dates remain attached to goals, milestones, and tasks while GoalGenius stays focused on execution." /><section className="surface-panel p-8 text-center"><h2 className="text-xl font-semibold text-white">Plan in the goal view</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Calendar synchronization is intentionally deferred. Use due dates on the goal execution page for now.</p></section></AppPage>;
}
