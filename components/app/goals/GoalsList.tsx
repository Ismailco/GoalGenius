import type { Goal } from '@/app/types';
import GoalRow, { type GoalOverviewModel } from '@/components/app/goals/GoalRow';

interface GoalsListProps {
  goals: GoalOverviewModel[];
  today: string;
  onDelete: (goal: Goal) => void;
  onUpdated?: () => void | Promise<void>;
}

export default function GoalsList({ goals, today, onDelete, onUpdated }: GoalsListProps) {
  return (
    <section className="overflow-visible rounded-[var(--radius-container)] border border-[var(--border-default)] bg-[var(--bg-surface)]" aria-label="Goals list">
      <div className="hidden border-b border-[var(--border-subtle)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] xl:grid xl:grid-cols-[minmax(17rem,1.65fr)_minmax(13rem,1.2fr)_minmax(6rem,.7fr)_minmax(10rem,1fr)_auto] xl:gap-4">
        <span>Goal</span>
        <span>Next milestone</span>
        <span>Target</span>
        <span>Progress</span>
        <span className="sr-only">Actions</span>
      </div>
      {goals.map((model) => (
        <GoalRow key={model.goal.id} model={model} today={today} onDelete={onDelete} onUpdated={onUpdated} />
      ))}
    </section>
  );
}
