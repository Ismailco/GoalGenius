'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Note } from '@/app/types';
import CreateNoteModal from '@/components/app/notes/CreateNoteModal';
import NotesEmptyState from '@/components/app/notes/NotesEmptyState';
import NotesHeader from '@/components/app/notes/NotesHeader';
import NotesList from '@/components/app/notes/NotesList';
import NotesSkeleton from '@/components/app/notes/NotesSkeleton';
import NotesToolbar from '@/components/app/notes/NotesToolbar';
import { AppPage } from '@/components/app/shared/AppPage';
import AlertModal from '@/components/common/AlertModal';
import { filterNotes, sortNotes } from '@/lib/domain/notes';
import { getUserFriendlyErrorMessage } from '@/lib/error';
import { deleteNote, getNotes, updateNote } from '@/lib/storage';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';

interface ConfirmationState {
  message: string;
  onConfirm: () => void | Promise<void>;
  title: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const newNoteButtonRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setNotes(sortNotes(await getNotes()));
      setHasLoaded(true);
    } catch {
      setError('Notes could not load. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const handleWorkspaceSync = () => void load();
    window.addEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
    return () => window.removeEventListener(WORKSPACE_SYNC_EVENT, handleWorkspaceSync);
  }, [load]);

  const categories = useMemo(
    () => Array.from(new Set(notes.map((note) => note.category?.trim()).filter((value): value is string => Boolean(value)))).sort((left, right) => left.localeCompare(right)),
    [notes],
  );
  const filteredNotes = useMemo(() => filterNotes(notes, { category, query }), [category, notes, query]);
  const hasActiveFilters = Boolean(query.trim() || category);

  function clearFilters() {
    setQuery('');
    setCategory('');
  }

  function openNewNote() {
    setSelectedNote(undefined);
    setIsModalOpen(true);
  }

  function openEditNote(note: Note) {
    setSelectedNote(note);
    setIsModalOpen(true);
  }

  function closeNoteModal() {
    setIsModalOpen(false);
    setSelectedNote(undefined);
    requestAnimationFrame(() => newNoteButtonRef.current?.focus());
  }

  async function handleTogglePin(note: Note) {
    try {
      await updateNote(note.id, { isPinned: !note.isPinned });
      await load();
      window.addNotification?.({
        title: note.isPinned ? 'Note unpinned' : 'Note pinned',
        message: `${note.title.trim() || 'Untitled note'} was updated.`,
        type: 'success',
      });
    } catch (mutationError) {
      setError(getUserFriendlyErrorMessage(mutationError));
    }
  }

  function requestDelete(note: Note) {
    const title = note.title.trim() || 'Untitled note';
    setConfirmation({
      title: 'Delete note?',
      message: `Delete “${title}”? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteNote(note.id);
          await load();
          window.addNotification?.({ title: 'Deleted', message: 'The note was removed.', type: 'success' });
        } catch (mutationError) {
          setError(getUserFriendlyErrorMessage(mutationError));
        }
      },
    });
  }

  if (loading) return <AppPage><NotesSkeleton /></AppPage>;

  if (!hasLoaded) {
    return (
      <AppPage>
        <div className="app-empty-state px-5 py-8" role="alert">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Notes could not load</h1>
          <p className="mt-2 text-sm">{error ?? 'Try loading your notes again.'}</p>
          <button type="button" className="app-button mt-5" onClick={() => void load()}>Retry</button>
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <div className="flex flex-col gap-5">
        <NotesHeader buttonRef={newNoteButtonRef} onNewNote={openNewNote} />

        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--text-primary)]" role="alert">
            <span>{error}</span>
            <button type="button" className="app-button-ghost app-button-sm" onClick={() => void load()}>Retry</button>
          </div>
        ) : null}

        <NotesToolbar
          categories={categories}
          category={category}
          query={query}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {filteredNotes.length > 0 ? (
          <NotesList notes={filteredNotes} onDelete={requestDelete} onEdit={openEditNote} onTogglePin={handleTogglePin} />
        ) : (
          <NotesEmptyState hasActiveFilters={hasActiveFilters} hasNotes={notes.length > 0} onClear={clearFilters} onNewNote={openNewNote} />
        )}
      </div>

      <CreateNoteModal
        isOpen={isModalOpen}
        existingNote={selectedNote}
        onClose={closeNoteModal}
        onSave={() => void load()}
      />

      {confirmation ? (
        <AlertModal
          title={confirmation.title}
          message={confirmation.message}
          type="warning"
          isConfirmation
          confirmLabel="Delete note"
          onClose={() => setConfirmation(null)}
          onConfirm={confirmation.onConfirm}
        />
      ) : null}
    </AppPage>
  );
}
