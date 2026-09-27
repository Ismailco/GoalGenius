'use client';

import { Pin } from 'lucide-react';
import type { Note } from '@/app/types';
import OverflowMenu from '@/components/app/shared/OverflowMenu';
import { stripMarkdown } from '@/lib/markdown';

interface NoteRowProps {
  note: Note;
  onDelete: (note: Note) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

function displayTitle(note: Note): string {
  return note.title.trim() || 'Untitled note';
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Updated date unavailable';

  const currentYear = new Date().getFullYear();
  const year = date.getFullYear() === currentYear ? undefined : 'numeric';
  return `Updated ${new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year }).format(date)}`;
}

function previewContent(content: string): string {
  const plainText = stripMarkdown(content).replace(/\s+/g, ' ').trim();
  return plainText || 'No content yet';
}

export default function NoteRow({ note, onDelete, onEdit, onTogglePin }: NoteRowProps) {
  const title = displayTitle(note);

  return (
    <article className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-4 transition-colors hover:bg-[var(--bg-surface-hover)] sm:px-5">
      <button
        type="button"
        onClick={() => onEdit(note)}
        className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
        aria-label={`Open ${title}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 break-words text-[0.95rem] font-semibold text-[var(--text-primary)]">{title}</span>
          {note.isPinned ? (
            <>
              <Pin className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
              <span className="sr-only">Pinned</span>
            </>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-3 break-words text-sm leading-6 text-[var(--text-secondary)]">{previewContent(note.content)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
          {note.category?.trim() ? <span>{note.category.trim()}</span> : null}
          <span>{formatUpdatedAt(note.updatedAt)}</span>
        </div>
      </button>

      <div className="pt-0.5">
        <OverflowMenu ariaLabel={`Actions for ${title}`}>
          <button type="button" role="menuitem" className="app-button-ghost flex w-full justify-start !px-3 !py-2 text-sm" onClick={() => onEdit(note)}>
            Edit
          </button>
          <button type="button" role="menuitem" className="app-button-ghost flex w-full justify-start !px-3 !py-2 text-sm" onClick={() => onTogglePin(note)}>
            {note.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button type="button" role="menuitem" className="app-button-ghost flex w-full justify-start !px-3 !py-2 text-sm text-[var(--danger)] hover:text-[var(--danger)]" onClick={() => onDelete(note)}>
            Delete
          </button>
        </OverflowMenu>
      </div>
    </article>
  );
}
