export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
}

export interface MilestoneProgressInput {
  completed?: boolean;
  tasksCompleted: number;
  tasksTotal: number;
}

/**
 * A manually completed milestone is treated as complete. Otherwise, tasks
 * determine progress when they exist; an empty milestone remains at 0% until
 * it is deliberately completed.
 */
export function calculateMilestoneProgress({
  completed = false,
  tasksCompleted,
  tasksTotal,
}: MilestoneProgressInput): number {
  if (completed) return 100;
  if (tasksTotal <= 0) return 0;
  return calculateProgress(tasksCompleted, tasksTotal);
}

export function calculateGoalProgress(
  milestones: MilestoneProgressInput[],
  status?: 'not-started' | 'in-progress' | 'completed',
): number {
  if (status === 'completed') return 100;
  if (milestones.length === 0) return 0;

  const total = milestones.reduce(
    (sum, milestone) => sum + calculateMilestoneProgress(milestone),
    0,
  );
  return Math.round(total / milestones.length);
}
