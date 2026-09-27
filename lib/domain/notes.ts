import type { Note } from '@/app/types';

export interface NoteFilters {
  category?: string;
  query?: string;
}

function timestampValue(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareNotes(left: Note, right: Note, sourceOrder: Map<string, number>): number {
  if (Boolean(left.isPinned) !== Boolean(right.isPinned)) {
    return left.isPinned ? -1 : 1;
  }

  const updatedDifference = timestampValue(right.updatedAt) - timestampValue(left.updatedAt);
  if (updatedDifference !== 0) return updatedDifference;

  const createdDifference = timestampValue(right.createdAt) - timestampValue(left.createdAt);
  if (createdDifference !== 0) return createdDifference;

  return (sourceOrder.get(left.id) ?? 0) - (sourceOrder.get(right.id) ?? 0);
}

export function sortNotes(notes: Note[]): Note[] {
  const sourceOrder = new Map(notes.map((note, index) => [note.id, index]));
  return [...notes].sort((left, right) => compareNotes(left, right, sourceOrder));
}

export function filterNotes(notes: Note[], filters: NoteFilters): Note[] {
  const query = filters.query?.trim().toLocaleLowerCase() ?? '';
  const category = filters.category?.trim() ?? '';

  return notes.filter((note) => {
    const matchesQuery = !query || [note.title, note.content].some((value) =>
      value.toLocaleLowerCase().includes(query),
    );
    const matchesCategory = !category || note.category?.trim() === category;
    return matchesQuery && matchesCategory;
  });
}
