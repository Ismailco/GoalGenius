'use client';

import { RefreshCw, Trash2 } from 'lucide-react';
import type { Goal } from '@/app/types';
import EditGoalModal from '@/components/app/goals/EditGoalModal';
import OverflowMenu from '@/components/app/shared/OverflowMenu';

interface GoalActionsMenuProps {
  goal: Goal;
  onDelete?: (goal: Goal) => void;
  onUpdated?: (goal: Goal) => void | Promise<void>;
  onRefresh?: () => void;
  showDelete?: boolean;
}

export default function GoalActionsMenu({ goal, onDelete, onUpdated, onRefresh, showDelete = true }: GoalActionsMenuProps) {
  return (
    <OverflowMenu ariaLabel={`Actions for ${goal.title}`}>
          <EditGoalModal
            goal={goal}
            onUpdated={onUpdated}
            role="menuitem"
            className="flex w-full items-center justify-start rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
          />
          {onRefresh ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          ) : null}
          {showDelete && onDelete ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-left text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--danger-soft)] hover:text-[var(--text-primary)]"
              onClick={() => onDelete(goal)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          ) : null}
    </OverflowMenu>
  );
}
