import assert from 'node:assert/strict';
import {
  calculateGoalProgress,
  calculateMilestoneProgress,
  calculateProgress,
} from '../lib/domain/progress.ts';
import { nextOccurrenceDate, reminderDate } from '../lib/domain/recurrence.ts';
import { parseDateOnly } from '../lib/domain/date-only.ts';

assert.equal(calculateProgress(0, 0), 0);
assert.equal(calculateProgress(1, 4), 25);
assert.equal(calculateProgress(10, 4), 100);
assert.equal(calculateProgress(-1, 4), 0);

assert.equal(calculateMilestoneProgress({ tasksCompleted: 0, tasksTotal: 0 }), 0);
assert.equal(calculateMilestoneProgress({ tasksCompleted: 1, tasksTotal: 4 }), 25);
assert.equal(calculateMilestoneProgress({ completed: true, tasksCompleted: 0, tasksTotal: 4 }), 100);
assert.equal(calculateMilestoneProgress({ completed: true, tasksCompleted: 0, tasksTotal: 1 }), 100);
assert.equal(calculateMilestoneProgress({ completed: false, tasksCompleted: 0, tasksTotal: 0 }), 0);
assert.equal(calculateGoalProgress([], 'in-progress'), 0);
assert.equal(calculateGoalProgress([
  { completed: true, tasksCompleted: 0, tasksTotal: 0 },
  { tasksCompleted: 1, tasksTotal: 4 },
]), 63);
assert.equal(calculateGoalProgress([], 'completed'), 100);

assert.equal(nextOccurrenceDate('2026-01-31', 'monthly'), '2026-02-28');
assert.equal(nextOccurrenceDate('2024-01-31', 'monthly'), '2024-02-29');
assert.equal(nextOccurrenceDate('2025-01-31', 'monthly'), '2025-02-28');
assert.equal(nextOccurrenceDate('2025-03-31', 'monthly'), '2025-04-30');
assert.equal(nextOccurrenceDate('2026-02-28', 'daily'), '2026-03-01');
assert.equal(nextOccurrenceDate('2026-02-28', 'weekly'), '2026-03-07');
assert.equal(nextOccurrenceDate('2026-02-28', 'none'), null);
assert.equal(reminderDate('2026-02-28', '1d')?.toISOString(), '2026-02-27T00:00:00.000Z');
const localDate = parseDateOnly('2026-02-28');
assert.equal(localDate.getFullYear(), 2026);
assert.equal(localDate.getMonth(), 1);
assert.equal(localDate.getDate(), 28);

console.log('Progress behavior tests passed.');
