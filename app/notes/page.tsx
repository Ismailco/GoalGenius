'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Note } from '@/app/types';
import MarkdownPreview from '@/components/app/notes/MarkdownPreview';
import AlertModal from '@/components/common/AlertModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getUserFriendlyErrorMessage } from '@/lib/error';
import { stripMarkdown } from '@/lib/markdown';
import { createNote, deleteNote, getNotes, updateNote } from '@/lib/storage';
import { validateAndSanitizeInput } from '@/lib/validation';

type ActiveNoteId = string | 'new' | null;

interface NoteEditorState {
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
}

interface FormErrors {
  title?: string;
  content?: string;
  category?: string;
}

const EMPTY_EDITOR_STATE: NoteEditorState = {
  title: '',
  content: '',
  category: '',
  isPinned: false,
};

function sortNotesByActivity(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function mapNoteToEditorState(note: Note): NoteEditorState {
  return {
    title: note.title,
    content: note.content,
    category: note.category ?? '',
    isPinned: note.isPinned ?? false,
  };
}

function summarizeNote(markdown: string): string {
  const summary = stripMarkdown(markdown);

  if (!summary) {
    return 'No content yet';
  }

  if (summary.length <= 90) {
    return summary;
  }

  return `${summary.slice(0, 90).trim()}...`;
}

function validateEditorState(editorState: NoteEditorState): {
  errors: FormErrors;
  sanitizedState: NoteEditorState | null;
} {
  const titleValidation = validateAndSanitizeInput(editorState.title, 'title', true);
  const contentValidation = validateAndSanitizeInput(
    editorState.content,
    'noteContent',
    true,
  );
  const categoryValidation = validateAndSanitizeInput(
    editorState.category,
    'category',
    false,
  );

  const errors: FormErrors = {};

  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }

  if (!contentValidation.isValid) {
    errors.content = contentValidation.error;
  }

  if (!categoryValidation.isValid) {
    errors.category = categoryValidation.error;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, sanitizedState: null };
  }

  return {
    errors,
    sanitizedState: {
      title: titleValidation.sanitizedValue,
      content: contentValidation.sanitizedValue,
      category: categoryValidation.sanitizedValue,
      isPinned: editorState.isPinned,
    },
  };
}

export default function NotesPage() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<ActiveNoteId>(null);
  const [editorState, setEditorState] = useState<NoteEditorState>(EMPTY_EDITOR_STATE);
  const [savedState, setSavedState] = useState<NoteEditorState>(EMPTY_EDITOR_STATE);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirmation?: boolean;
    onConfirm?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
  });

  const filteredNotes = sortNotesByActivity(notes).filter((note) => {
    const query = searchQuery.toLowerCase();

    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  const activeNote =
    activeNoteId && activeNoteId !== 'new'
      ? notes.find((note) => note.id === activeNoteId)
      : undefined;

  const isDirty =
    editorState.title !== savedState.title ||
    editorState.content !== savedState.content ||
    editorState.category !== savedState.category ||
    editorState.isPinned !== savedState.isPinned;

  useEffect(() => {
    let isActive = true;

    const loadNotes = async () => {
      try {
        const loadedNotes = sortNotesByActivity(await getNotes());

        if (!isActive) {
          return;
        }

        setMounted(true);
        setNotes(loadedNotes);

        if (loadedNotes.length > 0) {
          const firstNote = loadedNotes[0];
          const initialState = mapNoteToEditorState(firstNote);

          setActiveNoteId(firstNote.id);
          setEditorState(initialState);
          setSavedState(initialState);
        }
      } catch {
        if (!isActive) {
          return;
        }

        setMounted(true);
        setAlert({
          show: true,
          title: 'Error',
          message: 'Failed to load notes',
          type: 'error',
        });
      }
    };

    loadNotes();

    return () => {
      isActive = false;
    };
  }, []);

  function clearEditor() {
    setActiveNoteId(null);
    setEditorState(EMPTY_EDITOR_STATE);
    setSavedState(EMPTY_EDITOR_STATE);
    setErrors({});
    setIsEditing(false);
  }

  function openNote(note: Note, nextEditing = false) {
    const nextState = mapNoteToEditorState(note);

    setActiveNoteId(note.id);
    setEditorState(nextState);
    setSavedState(nextState);
    setErrors({});
    setIsEditing(nextEditing);
  }

  function startNewNote() {
    setActiveNoteId('new');
    setEditorState(EMPTY_EDITOR_STATE);
    setSavedState(EMPTY_EDITOR_STATE);
    setErrors({});
    setIsEditing(true);
  }

  async function refreshNotes(nextSelection: ActiveNoteId = activeNoteId) {
    const refreshedNotes = sortNotesByActivity(await getNotes());
    setNotes(refreshedNotes);

    if (nextSelection && nextSelection !== 'new') {
      const matchingNote = refreshedNotes.find((note) => note.id === nextSelection);

      if (matchingNote) {
        openNote(matchingNote, false);
        return;
      }
    }

    if (refreshedNotes.length > 0) {
      openNote(refreshedNotes[0], false);
      return;
    }

    clearEditor();
  }

  function clearFieldError(field: keyof FormErrors) {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });
  }

  function guardUnsavedChanges(action: () => void) {
    if (!isDirty || !isEditing) {
      action();
      return;
    }

    setAlert({
      show: true,
      title: 'Discard changes?',
      message: 'You have unsaved edits for this note. Continue without saving?',
      type: 'warning',
      isConfirmation: true,
      onConfirm: action,
    });
  }

  function handleSelectNote(note: Note) {
    if (note.id === activeNoteId && !isEditing) {
      return;
    }

    guardUnsavedChanges(() => openNote(note, false));
  }

  function handleCreateNewNote() {
    if (activeNoteId === 'new' && isEditing) {
      return;
    }

    guardUnsavedChanges(() => startNewNote());
  }

  function handleCancelEditing() {
    if (activeNote && activeNoteId !== 'new') {
      openNote(activeNote, false);
      return;
    }

    if (notes.length > 0) {
      openNote(sortNotesByActivity(notes)[0], false);
      return;
    }

    clearEditor();
  }

  async function handleSaveNote() {
    const { errors: validationErrors, sanitizedState } = validateEditorState(editorState);

    if (!sanitizedState) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: sanitizedState.title,
        content: sanitizedState.content,
        category: sanitizedState.category || undefined,
        isPinned: sanitizedState.isPinned,
      };

      const savedNote =
        activeNoteId && activeNoteId !== 'new'
          ? await updateNote(activeNoteId, payload)
          : await createNote(payload);

      await refreshNotes(savedNote.id);

      window.addNotification?.({
        title: 'Saved',
        message:
          activeNoteId === 'new'
            ? 'Your note was created.'
            : 'Your note was updated.',
        type: 'success',
      });
    } catch (error) {
      setAlert({
        show: true,
        title: 'Error',
        message: getUserFriendlyErrorMessage(error),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteNote() {
    if (!activeNote || !activeNoteId || activeNoteId === 'new') {
      return;
    }

    setAlert({
      show: true,
      title: 'Delete note?',
      message: 'This note will be removed permanently.',
      type: 'warning',
      isConfirmation: true,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteNote(activeNoteId);
            await refreshNotes();
            window.addNotification?.({
              title: 'Deleted',
              message: 'The note was removed.',
              type: 'success',
            });
          } catch (error) {
            setAlert({
              show: true,
              title: 'Error',
              message: getUserFriendlyErrorMessage(error),
              type: 'error',
            });
          }
        })();
      },
    });
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="absolute left-0 h-full w-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl" />
        <div className="container relative z-10 mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="h-[72vh] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            <div className="h-[72vh] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="absolute left-0 h-full w-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 py-8">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Your Notes
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                Select a note on the left. Markdown is rendered on the right.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateNewNote}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:from-indigo-600 hover:to-purple-600"
            >
              New Note
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg">
            <div className="border-b border-white/10 p-5">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-400/50 focus:outline-none"
              />
            </div>

            <div className="max-h-[72vh] space-y-2 overflow-y-auto p-4">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => {
                  const isSelected = note.id === activeNoteId && !isEditing;

                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => handleSelectNote(note)}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                        isSelected
                          ? 'border-blue-400/50 bg-blue-500/10'
                          : 'border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {note.title}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-gray-400">
                            {summarizeNote(note.content)}
                          </p>
                        </div>

                        {note.isPinned && (
                          <span className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-purple-300">
                            Pin
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{note.category || 'General'}</span>
                        <span>{format(new Date(note.updatedAt), 'MMM d')}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-center text-sm text-gray-400">
                  {searchQuery
                    ? 'No notes match your search.'
                    : 'No notes yet. Create your first one.'}
                </div>
              )}
            </div>
          </aside>

          <section className="min-h-[72vh] overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg">
            {!activeNote && activeNoteId !== 'new' ? (
              <div className="flex h-full min-h-[72vh] items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <h2 className="text-2xl font-semibold text-white">No note selected</h2>
                  <p className="mt-3 text-sm text-gray-400">
                    Choose a note from the left or create a new one.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-white/10 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-3xl font-semibold text-white">
                        {isEditing
                          ? activeNoteId === 'new'
                            ? 'New Note'
                            : 'Edit Note'
                          : editorState.title || 'Untitled note'}
                      </h2>
                      {!isEditing && (
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                          <span>{editorState.category || 'General'}</span>
                          <span>
                            {activeNote
                              ? `Updated ${format(new Date(activeNote.updatedAt), 'MMM d, yyyy')}`
                              : 'Unsaved draft'}
                          </span>
                          {editorState.isPinned && <span>Pinned</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {activeNote && !isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteNote}
                            className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEditing}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          {activeNote && activeNoteId !== 'new' && (
                            <button
                              type="button"
                              onClick={handleDeleteNote}
                              className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleSaveNote}
                            disabled={
                              isSaving ||
                              !editorState.title.trim() ||
                              !editorState.content.trim() ||
                              !isDirty
                            }
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:from-indigo-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSaving && <LoadingSpinner size="small" />}
                            {activeNoteId === 'new' ? 'Create' : 'Save'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="note-title"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          Title
                        </label>
                        <input
                          id="note-title"
                          type="text"
                          value={editorState.title}
                          onChange={(event) => {
                            setEditorState((currentState) => ({
                              ...currentState,
                              title: event.target.value,
                            }));
                            clearFieldError('title');
                          }}
                          className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none ${
                            errors.title
                              ? 'border-red-500'
                              : 'border-white/10 focus:border-blue-400/50'
                          }`}
                          placeholder="Untitled note"
                        />
                        {errors.title && (
                          <p className="mt-2 text-sm text-red-400">{errors.title}</p>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                        <div>
                          <label
                            htmlFor="note-category"
                            className="mb-2 block text-sm font-medium text-gray-300"
                          >
                            Category
                          </label>
                          <input
                            id="note-category"
                            type="text"
                            value={editorState.category}
                            onChange={(event) => {
                              setEditorState((currentState) => ({
                                ...currentState,
                                category: event.target.value,
                              }));
                              clearFieldError('category');
                            }}
                            className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none ${
                              errors.category
                                ? 'border-red-500'
                                : 'border-white/10 focus:border-blue-400/50'
                            }`}
                            placeholder="Optional category"
                          />
                          {errors.category && (
                            <p className="mt-2 text-sm text-red-400">{errors.category}</p>
                          )}
                        </div>

                        <label className="flex items-end gap-3 pb-3 text-sm font-medium text-gray-300">
                          <input
                            type="checkbox"
                            checked={editorState.isPinned}
                            onChange={(event) =>
                              setEditorState((currentState) => ({
                                ...currentState,
                                isPinned: event.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                          />
                          Pin note
                        </label>
                      </div>

                      <div>
                        <label
                          htmlFor="note-content"
                          className="mb-2 block text-sm font-medium text-gray-300"
                        >
                          Content
                        </label>
                        <textarea
                          id="note-content"
                          value={editorState.content}
                          onChange={(event) => {
                            setEditorState((currentState) => ({
                              ...currentState,
                              content: event.target.value,
                            }));
                            clearFieldError('content');
                          }}
                          rows={20}
                          className={`w-full rounded-3xl border bg-slate-950/50 px-5 py-4 font-mono text-sm leading-7 text-gray-100 placeholder:text-gray-500 focus:outline-none ${
                            errors.content
                              ? 'border-red-500'
                              : 'border-white/10 focus:border-blue-400/50'
                          }`}
                          placeholder={`# Note title\n\nWrite in markdown here...`}
                        />
                        {errors.content ? (
                          <p className="mt-2 text-sm text-red-400">{errors.content}</p>
                        ) : (
                          <p className="mt-2 text-sm text-gray-400">
                            Markdown is supported. Save to view the rendered note.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <MarkdownPreview
                      content={editorState.content}
                      emptyMessage="This note is empty."
                    />
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        {alert.show && (
          <AlertModal
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, show: false })}
            isConfirmation={alert.isConfirmation}
            onConfirm={alert.onConfirm}
          />
        )}
      </div>
    </div>
  );
}
