import assert from 'node:assert/strict';
import {
  APP_NAV_ITEMS,
  APP_UTILITY_NAV_ITEMS,
  getActiveNavigationItem,
  isNavigationItemActive,
  MOBILE_PRIMARY_NAV_ITEMS,
} from '../components/app/shared/navigation.ts';

assert.deepEqual(
  APP_NAV_ITEMS.map((item) => item.name),
  ['Today', 'Goals', 'Tasks', 'Check-ins', 'Notes'],
);
assert.deepEqual(
  MOBILE_PRIMARY_NAV_ITEMS.map((item) => item.name),
  ['Today', 'Goals', 'Tasks', 'Check-ins'],
);
assert.deepEqual(
  APP_UTILITY_NAV_ITEMS.map((item) => item.name),
  ['Settings'],
);

const goals = APP_NAV_ITEMS.find((item) => item.name === 'Goals');
assert.ok(goals);
assert.equal(isNavigationItemActive('/goals', goals), true);
assert.equal(isNavigationItemActive('/goals/goal-123', goals), true);
assert.equal(isNavigationItemActive('/milestones', goals), true);
assert.equal(getActiveNavigationItem('/dashboard')?.name, 'Today');
assert.equal(getActiveNavigationItem('/todos/todo-123')?.name, 'Tasks');
assert.equal(getActiveNavigationItem('/checkins')?.name, 'Check-ins');
assert.equal(getActiveNavigationItem('/notes')?.name, 'Notes');
assert.equal(getActiveNavigationItem('/settings')?.name, 'Settings');
assert.equal(getActiveNavigationItem('/milestones')?.name, 'Goals');

console.log('Navigation model tests passed.');
