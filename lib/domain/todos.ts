import type { Milestone, Todo } from '../../app/types/index.ts';

export type TodoDueBucket = 'overdue' | 'today' | 'upcoming' | 'undated';
export type TodoStatusFilter = 'open' | 'completed' | 'all';

export interface TodoFilterOptions {
  category?: string;
  goalId?: string;
  priority?: Todo['priority'];
  query?: string;
  status: TodoStatusFilter;
}

const TODO_PRIORITY_ORDER: Record<Todo['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function compareDescending(left: string, right: string): number {
  return right.localeCompare(left);
}

function compareOptionalAscending(left?: string, right?: string): number {
  if (left && right) return left.localeCompare(right);
  if (left) return -1;
  if (right) return 1;
  return 0;
}

function todoGroupRank(todo: Todo, today: string): number {
  if (!todo.dueDate) return 3;
  if (todo.dueDate < today) return 0;
  if (todo.dueDate === today) return 1;
  return 2;
}

export function getTodoDueBucket(todo: Todo, today: string): TodoDueBucket {
  if (!todo.dueDate) return 'undated';
  if (todo.dueDate < today) return 'overdue';
  if (todo.dueDate === today) return 'today';
  return 'upcoming';
}

/**
 * Resolves the goal used for task context without changing the stored task.
 * Milestone relationships are authoritative when a task has no direct goal.
 */
export function resolveTodoGoalId(todo: Todo, milestonesById: ReadonlyMap<string, string | Pick<Milestone, 'goalId'>>): string | null {
  if (todo.milestoneId) {
    const milestone = milestonesById.get(todo.milestoneId);
    const milestoneGoalId = typeof milestone === 'string' ? milestone : milestone?.goalId;
    if (milestoneGoalId) return milestoneGoalId;
  }
  return todo.goalId ?? null;
}

export function todoMatchesSearch(
  todo: Todo,
  query: string,
  context: { goalTitle?: string; milestoneTitle?: string } = {},
): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [todo.title, todo.description, context.goalTitle, context.milestoneTitle]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(normalizedQuery));
}

export function matchesTodoFilters(
  todo: Todo,
  options: TodoFilterOptions,
  context: { effectiveGoalId?: string | null; goalTitle?: string; milestoneTitle?: string } = {},
): boolean {
  if (options.status === 'open' && todo.completed) return false;
  if (options.status === 'completed' && !todo.completed) return false;
  if (options.goalId === 'standalone' && context.effectiveGoalId) return false;
  if (options.goalId && options.goalId !== 'standalone' && context.effectiveGoalId !== options.goalId) return false;
  if (options.priority && todo.priority !== options.priority) return false;
  if (options.category && todo.category !== options.category) return false;
  return todoMatchesSearch(todo, options.query ?? '', context);
}

/**
 * Orders work for an execution surface without mutating the source array.
 * Open work always precedes completed work; each group then uses due state,
 * priority, dates, and stable timestamps as tie-breakers.
 */
export function sortTodosByActionability(todos: Todo[], today: string): Todo[] {
  return todos
    .map((todo, index) => ({ todo, index }))
    .sort((left, right) => {
      const completionDifference = Number(left.todo.completed) - Number(right.todo.completed);
      if (completionDifference !== 0) return completionDifference;

      const groupDifference = todoGroupRank(left.todo, today) - todoGroupRank(right.todo, today);
      if (groupDifference !== 0) return groupDifference;

      const priorityDifference = TODO_PRIORITY_ORDER[left.todo.priority] - TODO_PRIORITY_ORDER[right.todo.priority];
      if (priorityDifference !== 0) return priorityDifference;

      const dueDateDifference = compareOptionalAscending(left.todo.dueDate, right.todo.dueDate);
      if (dueDateDifference !== 0) return dueDateDifference;

      const updatedDifference = compareDescending(left.todo.updatedAt, right.todo.updatedAt);
      if (updatedDifference !== 0) return updatedDifference;

      const createdDifference = compareDescending(left.todo.createdAt, right.todo.createdAt);
      if (createdDifference !== 0) return createdDifference;

      return left.index - right.index;
    })
    .map(({ todo }) => todo);
}
