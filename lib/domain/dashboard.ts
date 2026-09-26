import { differenceInCalendarDays } from 'date-fns';
import type { CheckIn, Goal, Milestone, Todo } from '../../app/types/index.ts';
import { getLatestGoalCheckIn } from './checkins.ts';
import { parseDateOnly } from './date-only.ts';
import { getGoalProgress, getNextMilestone, sortGoalsForOverview } from './goals.ts';
import { sortTodosByActionability } from './todos.ts';

export const CHECK_IN_STALE_DAYS = 7;
export const UPCOMING_TASK_LIMIT = 8;
export const UPCOMING_NEXT_HORIZON_DAYS = 7;

export interface DashboardGoalSummary {
  goal: Goal;
  hasMilestones: boolean;
  nextMilestone: Milestone | null;
  progress: number;
}

export interface DashboardReviewGoal {
  goal: Goal;
  lastCheckIn: CheckIn | null;
  daysSinceLastCheckIn: number | null;
}

export type UpcomingTaskGroupName = 'overdue' | 'today' | 'next';

export interface UpcomingTaskGroup {
  name: UpcomingTaskGroupName;
  tasks: Todo[];
}

function sortTodosForToday(todos: Todo[], today: string): Todo[] {
  return sortTodosByActionability(todos, today);
}

export { getGoalProgress, getNextMilestone } from './goals.ts';

export function getDashboardGoals(
  goals: Goal[],
  milestones: Milestone[],
  todos: Todo[],
  limit = 3,
): DashboardGoalSummary[] {
  return sortGoalsForOverview(goals.filter((goal) => goal.status !== 'completed'))
    .slice(0, limit)
    .map((goal) => ({
      goal,
      hasMilestones: milestones.some((milestone) => milestone.goalId === goal.id),
      nextMilestone: getNextMilestone(goal.id, milestones),
      progress: getGoalProgress(goal, milestones, todos),
    }));
}

export function selectNextTask(todos: Todo[], today: string): Todo | null {
  return sortTodosForToday(todos.filter((todo) => !todo.completed), today)[0] ?? null;
}

export function getGoalsNeedingCheckIn(
  goals: Goal[],
  checkIns: CheckIn[],
  today: string,
): DashboardReviewGoal[] {
  return sortGoalsForOverview(goals)
    .filter((goal) => goal.status !== 'completed')
    .map((goal) => {
      const lastCheckIn = getLatestGoalCheckIn(goal.id, checkIns);
      const daysSinceLastCheckIn = lastCheckIn
        ? differenceInCalendarDays(parseDateOnly(today), parseDateOnly(lastCheckIn.date))
        : null;

      return { goal, lastCheckIn, daysSinceLastCheckIn };
    })
    .filter(({ daysSinceLastCheckIn }) =>
      daysSinceLastCheckIn === null || daysSinceLastCheckIn > CHECK_IN_STALE_DAYS,
    );
}

function sortUpcomingTasks(tasks: Todo[]): Todo[] {
  return sortTodosByActionability(tasks, '9999-12-31');
}

export function groupUpcomingTasks(
  todos: Todo[],
  today: string,
  maxTotal = UPCOMING_TASK_LIMIT,
  nextHorizonDays = UPCOMING_NEXT_HORIZON_DAYS,
): UpcomingTaskGroup[] {
  const openTasks = todos.filter((todo) => !todo.completed);
  const overdue = sortUpcomingTasks(openTasks.filter((todo) => todo.dueDate && todo.dueDate < today));
  const todayTasks = sortUpcomingTasks(openTasks.filter((todo) => todo.dueDate === today));
  const nextDated = sortUpcomingTasks(openTasks.filter((todo) => {
    if (!todo.dueDate || todo.dueDate <= today) return false;
    const daysAway = differenceInCalendarDays(parseDateOnly(todo.dueDate), parseDateOnly(today));
    return daysAway <= nextHorizonDays;
  }));
  const undated = sortUpcomingTasks(openTasks.filter((todo) => !todo.dueDate));

  const groups: UpcomingTaskGroup[] = [];
  let remaining = maxTotal;

  const overdueTasks = overdue.slice(0, Math.min(3, remaining));
  if (overdueTasks.length > 0) {
    groups.push({ name: 'overdue', tasks: overdueTasks });
    remaining -= overdueTasks.length;
  }

  const todayTasksToShow = todayTasks.slice(0, Math.min(3, remaining));
  if (todayTasksToShow.length > 0) {
    groups.push({ name: 'today', tasks: todayTasksToShow });
    remaining -= todayTasksToShow.length;
  }

  if (remaining > 0) {
    const nextTasks = [...nextDated, ...undated].slice(0, remaining);
    if (nextTasks.length > 0) groups.push({ name: 'next', tasks: nextTasks });
  }

  return groups;
}
