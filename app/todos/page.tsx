'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Goal, Milestone, Todo } from '@/app/types';
import { AppPage } from '@/components/app/shared/AppPage';
import AlertModal from '@/components/common/AlertModal';
import CreateTodoModal from '@/components/app/todos/CreateTodoModal';
import TaskGroup from '@/components/app/todos/TaskGroup';
import TasksEmptyState from '@/components/app/todos/TasksEmptyState';
import TasksHeader from '@/components/app/todos/TasksHeader';
import TasksSkeleton from '@/components/app/todos/TasksSkeleton';
import TasksToolbar, { TaskStatusFilter } from '@/components/app/todos/TasksToolbar';
import { todayDateOnly } from '@/lib/domain/date-only';
import { getTodoDueBucket, matchesTodoFilters, resolveTodoGoalId, sortTodosByActionability } from '@/lib/domain/todos';
import { deleteTodo, getGoals, getMilestones, getTodos, toggleTodoComplete } from '@/lib/storage';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';

interface ConfirmationState {
  message: string;
  onConfirm: () => void | Promise<void>;
  title: string;
}

export default function TasksPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('open');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pendingTodoId, setPendingTodoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>();
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [nextTodos, nextGoals, nextMilestones] = await Promise.all([
        getTodos(),
        getGoals(),
        getMilestones(),
      ]);
      setTodos(nextTodos);
      setGoals(nextGoals);
      setMilestones(nextMilestones);
      setToday(todayDateOnly());
      setHasLoaded(true);
    } catch {
      setError('Tasks could not load. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const handleWorkspaceSync = () => void load();
    window.addEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
    return () => window.removeEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
  }, [load]);

  const effectiveToday = today || todayDateOnly();
  const goalsById = useMemo(() => new Map(goals.map((goal) => [goal.id, goal])), [goals]);
  const milestonesById = useMemo(() => new Map(milestones.map((milestone) => [milestone.id, milestone])), [milestones]);
  const milestoneGoalIds = useMemo(() => new Map(milestones.map((milestone) => [milestone.id, milestone.goalId])), [milestones]);
  const categories = useMemo(
    () => Array.from(new Set(todos.map((todo) => todo.category?.trim()).filter((category): category is string => Boolean(category)))).sort((left, right) => left.localeCompare(right)),
    [todos],
  );

  const filteredTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      const effectiveGoalId = resolveTodoGoalId(todo, milestoneGoalIds);
      return matchesTodoFilters(todo, {
        category: categoryFilter || undefined,
        goalId: goalFilter || undefined,
        priority: priorityFilter ? priorityFilter as Todo['priority'] : undefined,
        query,
        status: statusFilter,
      }, {
        effectiveGoalId,
        goalTitle: effectiveGoalId ? goalsById.get(effectiveGoalId)?.title : undefined,
        milestoneTitle: todo.milestoneId ? milestonesById.get(todo.milestoneId)?.title : undefined,
      });
    });

    return sortTodosByActionability(filtered, effectiveToday);
  }, [categoryFilter, effectiveToday, goalFilter, goalsById, milestoneGoalIds, milestonesById, priorityFilter, query, statusFilter, todos]);

  const groups = useMemo(() => {
    if (statusFilter === 'completed') return [{ heading: 'Completed', todos: filteredTodos }];

    const openTodos = filteredTodos.filter((todo) => !todo.completed);
    const nextGroups = [
      { heading: 'Overdue', todos: openTodos.filter((todo) => getTodoDueBucket(todo, effectiveToday) === 'overdue') },
      { heading: 'Today', todos: openTodos.filter((todo) => getTodoDueBucket(todo, effectiveToday) === 'today') },
      { heading: 'Upcoming', todos: openTodos.filter((todo) => getTodoDueBucket(todo, effectiveToday) === 'upcoming') },
      { heading: 'No date', todos: openTodos.filter((todo) => getTodoDueBucket(todo, effectiveToday) === 'undated') },
    ].filter((group) => group.todos.length > 0);

    if (statusFilter === 'all') {
      const completedTodos = filteredTodos.filter((todo) => todo.completed);
      if (completedTodos.length > 0) nextGroups.push({ heading: 'Completed', todos: completedTodos });
    }
    return nextGroups;
  }, [effectiveToday, filteredTodos, statusFilter]);

  const hasActiveFilters = Boolean(query.trim() || goalFilter || priorityFilter || categoryFilter || statusFilter !== 'open');

  function openNewTask() {
    setSelectedTodo(undefined);
    setIsModalOpen(true);
  }

  function openEditTask(todo: Todo) {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  }

  async function handleToggle(todo: Todo) {
    setPendingTodoId(todo.id);
    try {
      await toggleTodoComplete(todo.id);
      await load();
    } catch {
      setError('The task could not be updated. Please try again.');
    } finally {
      setPendingTodoId(null);
    }
  }

  async function handleDelete(todo: Todo) {
    setPendingTodoId(todo.id);
    try {
      await deleteTodo(todo.id);
      await load();
    } catch {
      setError('The task could not be deleted. Please try again.');
    } finally {
      setPendingTodoId(null);
    }
  }

  function requestDelete(todo: Todo) {
    setConfirmation({
      title: 'Delete task?',
      message: `Delete “${todo.title}”?`,
      onConfirm: () => handleDelete(todo),
    });
  }

  if (loading) return <AppPage><TasksSkeleton /></AppPage>;

  if (!hasLoaded) {
    return (
      <AppPage>
        <div className="app-empty-state px-5 py-8" role="alert">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Tasks could not load</h1>
          <p className="mt-2 text-sm">{error ?? 'Try loading your tasks again.'}</p>
          <button type="button" className="app-button mt-5" onClick={() => void load()}>Retry</button>
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <TasksHeader onNewTask={openNewTask} />

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--text-primary)]" role="alert">
          <span>{error}</span>
          <button type="button" className="app-button-ghost app-button-sm" onClick={() => void load()}>Retry</button>
        </div>
      ) : null}

      <TasksToolbar
        categories={categories}
        categoryFilter={categoryFilter}
        goalFilter={goalFilter}
        goals={goals}
        hasActiveFilters={hasActiveFilters}
        onCategoryChange={setCategoryFilter}
        onGoalChange={setGoalFilter}
        onPriorityChange={setPriorityFilter}
        onQueryChange={setQuery}
        onReset={() => {
          setQuery('');
          setGoalFilter('');
          setPriorityFilter('');
          setCategoryFilter('');
          setStatusFilter('open');
        }}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        query={query}
        statusFilter={statusFilter}
      />

      <section aria-label="Task groups" className="surface-panel px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <p className="text-sm text-[var(--text-secondary)]">
            {filteredTodos.length} {statusFilter === 'completed' ? 'completed' : statusFilter === 'all' ? 'matching' : 'open'} {filteredTodos.length === 1 ? 'task' : 'tasks'}
          </p>
          {refreshing ? <span className="text-xs text-[var(--text-muted)]" role="status">Updating…</span> : null}
        </div>

        {groups.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {groups.map((group) => (
              <TaskGroup
                key={group.heading}
                goalsById={goalsById}
                heading={group.heading}
                milestonesById={milestonesById}
                milestoneGoalIds={milestoneGoalIds}
                onDelete={requestDelete}
                onEdit={openEditTask}
                onToggle={handleToggle}
                pendingTodoId={pendingTodoId}
                today={effectiveToday}
                todos={group.todos}
              />
            ))}
          </div>
        ) : (
          <div className="pt-4">
            <TasksEmptyState
              hasActiveFilters={hasActiveFilters}
              hasAnyTasks={todos.length > 0}
              onClearFilters={() => {
                setQuery('');
                setGoalFilter('');
                setPriorityFilter('');
                setCategoryFilter('');
                setStatusFilter('open');
              }}
              onNewTask={openNewTask}
              onViewGoals={() => router.push('/goals')}
              status={statusFilter}
            />
          </div>
        )}
      </section>

      <CreateTodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTodo(undefined);
        }}
        existingTodo={selectedTodo}
        allowRelationshipSelection
        goals={goals}
        milestones={milestones}
        onSave={() => void load()}
      />

      {confirmation ? (
        <AlertModal
          title={confirmation.title}
          message={confirmation.message}
          type="warning"
          isConfirmation
          confirmLabel="Delete task"
          onClose={() => setConfirmation(null)}
          onConfirm={confirmation.onConfirm}
        />
      ) : null}
    </AppPage>
  );
}
