'use client';

import type { Note } from '@/app/types';
import NoteRow from './NoteRow';

interface NotesListProps {
  notes: Note[];
  onDelete: (note: Note) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

function NoteGroup({ heading, notes, onDelete, onEdit, onTogglePin }: NotesListProps & { heading: string }) {
  if (notes.length === 0) return null;

  const headingId = `${heading.toLowerCase().replace(/\s+/g, '-')}-heading`;
  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5">
        <h2 id={headingId} className="text-sm font-semibold text-[var(--text-primary)]">{heading}</h2>
        <span className="text-xs text-[var(--text-muted)]">{notes.length}</span>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {notes.map((note) => <NoteRow key={note.id} note={note} onDelete={onDelete} onEdit={onEdit} onTogglePin={onTogglePin} />)}
      </div>
    </section>
  );
}

export default function NotesList({ notes, onDelete, onEdit, onTogglePin }: NotesListProps) {
  const pinnedNotes = notes.filter((note) => note.isPinned);
  const otherNotes = notes.filter((note) => !note.isPinned);

  return (
    <div className="surface-panel notes-list-panel">
      <NoteGroup heading="Pinned" notes={pinnedNotes} onDelete={onDelete} onEdit={onEdit} onTogglePin={onTogglePin} />
      <NoteGroup heading="Notes" notes={otherNotes} onDelete={onDelete} onEdit={onEdit} onTogglePin={onTogglePin} />
    </div>
  );
}
