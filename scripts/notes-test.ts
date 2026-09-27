import assert from 'node:assert/strict';
import type { Note } from '../app/types/index.ts';
import { filterNotes, sortNotes } from '../lib/domain/notes.ts';

const note = (overrides: Partial<Note>): Note => ({
  id: 'base',
  title: 'Base note',
  content: 'Reference content',
  createdAt: '2026-09-20T09:00:00.000Z',
  updatedAt: '2026-09-20T09:00:00.000Z',
  ...overrides,
});

const source = [
  note({ id: 'older', updatedAt: '2026-09-18T09:00:00.000Z' }),
  note({ id: 'pinned', isPinned: true, updatedAt: '2026-09-19T09:00:00.000Z' }),
  note({ id: 'newest', updatedAt: '2026-09-21T09:00:00.000Z' }),
  note({ id: 'same-date', updatedAt: '2026-09-21T09:00:00.000Z', createdAt: '2026-09-22T09:00:00.000Z' }),
];

assert.deepEqual(sortNotes(source).map((item) => item.id), ['pinned', 'same-date', 'newest', 'older']);
assert.deepEqual(source.map((item) => item.id), ['older', 'pinned', 'newest', 'same-date']);

const invalidDates = [
  note({ id: 'invalid-first', updatedAt: 'not-a-date', createdAt: 'not-a-date' }),
  note({ id: 'invalid-second', updatedAt: 'not-a-date', createdAt: 'not-a-date' }),
];
assert.deepEqual(sortNotes(invalidDates).map((item) => item.id), ['invalid-first', 'invalid-second']);

const searchable = [
  note({ id: 'title-match', title: 'Launch requirements', category: 'Planning' }),
  note({ id: 'content-match', title: 'Reference', content: 'OAuth callback details', category: 'Engineering' }),
  note({ id: 'other', title: 'Shopping list', content: 'Coffee and tea' }),
];
assert.deepEqual(filterNotes(searchable, { query: 'oauth' }).map((item) => item.id), ['content-match']);
assert.deepEqual(filterNotes(searchable, { query: 'LAUNCH', category: 'Planning' }).map((item) => item.id), ['title-match']);
assert.deepEqual(filterNotes(searchable, { category: 'Missing' }), []);
assert.equal(filterNotes(searchable, {}).length, 3);

console.log('Notes domain tests passed.');
