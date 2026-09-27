'use client';

import { Plus } from 'lucide-react';

interface NotesHeaderProps {
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  onNewNote: () => void;
}

export default function NotesHeader({ buttonRef, onNewNote }: NotesHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="page-title">Notes</h1>
        <p className="page-description">Capture information you want to keep nearby.</p>
      </div>
      <button ref={buttonRef} type="button" onClick={onNewNote} className="app-button self-start sm:self-auto">
        <Plus className="h-4 w-4" aria-hidden="true" />
        New note
      </button>
    </header>
  );
}
