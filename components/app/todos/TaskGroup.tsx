'use client';

import type { Goal, Milestone, Todo } from '@/app/types';
import TaskRow from '@/components/app/todos/TaskRow';
import { resolveTodoGoalId } from '@/lib/domain/todos';

interface TaskGroupProps {
  goalsById: Map<string, Goal>;
  heading: string;
  milestonesById: Map<string, Milestone>;
  milestoneGoalIds: Map<string, string>;
  onDelete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onToggle: (todo: Todo) => void;
  pendingTodoId: string | null;
  today: string;
  todos: Todo[];
}

export default function TaskGroup({ goalsById, heading, milestonesById, milestoneGoalIds, onDelete, onEdit, onToggle, pendingTodoId, today, todos }: TaskGroupProps) {
  return (
    <section aria-labelledby={`task-group-${heading.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="flex items-baseline justify-between gap-3 py-2">
        <h2 id={`task-group-${heading.toLowerCase().replaceAll(' ', '-')}`} className="text-sm font-semibold text-[var(--text-primary)]">{heading}</h2>
        <span className="text-xs text-[var(--text-muted)]">{todos.length}</span>
      </div>
      <div className="border-y border-[var(--border-default)]">
        {todos.map((todo) => (
          <TaskRow
            key={todo.id}
            goal={goalsById.get(resolveTodoGoalId(todo, milestoneGoalIds) ?? '')}
            milestone={todo.milestoneId ? milestonesById.get(todo.milestoneId) : undefined}
            onDelete={onDelete}
            onEdit={onEdit}
            onToggle={onToggle}
            pending={pendingTodoId === todo.id}
            today={today}
            todo={todo}
          />
        ))}
      </div>
    </section>
  );
}
