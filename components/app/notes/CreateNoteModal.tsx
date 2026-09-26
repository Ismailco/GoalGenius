'use client';

import { useState, useEffect, useRef } from 'react';
import { Note } from '@/app/types';
import { createNote, updateNote } from '@/lib/storage';
import { validateAndSanitizeInput, ValidationResult, unescapeForDisplay } from '@/lib/validation';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import AppModal from '@/components/app/shared/AppModal';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNote?: Note;
  onSave?: (note: Note) => void;
}

interface FormErrors {
  title?: string;
  content?: string;
  category?: string;
}

export default function CreateNoteModal({
  isOpen,
  onClose,
  existingNote,
  onSave,
}: CreateNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    modalRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (existingNote) {
      setTitle(unescapeForDisplay(existingNote.title));
      setContent(unescapeForDisplay(existingNote.content));
      setCategory(existingNote.category ? unescapeForDisplay(existingNote.category) : '');
      setIsPinned(existingNote.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setCategory('');
      setIsPinned(false);
    }
    setErrors({});
  }, [existingNote, isOpen]);

  if (!isOpen) return null;

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'title':
        return validateAndSanitizeInput(value, 'title', true);
      case 'content':
        return validateAndSanitizeInput(value, 'noteContent', true);
      case 'category':
        return validateAndSanitizeInput(value, 'category', false);
      default:
        return { isValid: true, sanitizedValue: value };
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const validationResult = validateField(name, value);

    // Update the form data with sanitized value
    switch (name) {
      case 'title':
        setTitle(validationResult.sanitizedValue);
        break;
      case 'content':
        setContent(validationResult.sanitizedValue);
        break;
      case 'category':
        setCategory(validationResult.sanitizedValue);
        break;
    }

    // Update errors
    setErrors(prev => ({
      ...prev,
      [name]: validationResult.error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const titleValidation = validateField('title', title);
    const contentValidation = validateField('content', content);
    const categoryValidation = validateField('category', category);

    const newErrors: FormErrors = {};
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error;
    }
    if (!contentValidation.isValid) {
      newErrors.content = contentValidation.error;
    }
    if (!categoryValidation.isValid) {
      newErrors.category = categoryValidation.error;
    }

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const noteData = {
      title: titleValidation.sanitizedValue,
      content: contentValidation.sanitizedValue,
      category: categoryValidation.sanitizedValue || undefined,
      isPinned,
    };

    await handleAsyncOperation(
      async () => {
        const savedNote = await (existingNote
          ? updateNote(existingNote.id, noteData)
          : createNote(noteData));
        onSave?.(savedNote);
        onClose();
      },
      setIsLoading,
      (error) => {
        window.addNotification?.({
          title: 'Error',
          message: getUserFriendlyErrorMessage(error),
          type: 'error'
        });
      }
    );
  };

  return (
    <AppModal title={existingNote ? 'Edit Note' : 'Create New Note'} onClose={onClose} size="md" closeDisabled={isLoading}>
      <div ref={modalRef} className="relative">
        {isLoading && <LoadingOverlay role="status" aria-label="Saving note..." />}
          <form onSubmit={handleSubmit} aria-label={existingNote ? 'Edit note form' : 'Create note form'}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={handleChange}
                  className={`app-field ${errors.title ? 'border-red-500' : ''}`}
                  required
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="app-form-error mt-1" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Content (Markdown supported)
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={handleChange}
                  rows={6}
                  className={`app-field min-h-40 ${errors.content ? 'border-red-500' : ''}`}
                  required
                  aria-invalid={!!errors.content}
                  aria-describedby={errors.content ? "content-error" : undefined}
                />
                {errors.content && (
                  <p id="content-error" className="app-form-error mt-1" role="alert">
                    {errors.content}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Category (optional)
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={category}
                  onChange={handleChange}
                  className={`app-field ${errors.category ? 'border-red-500' : ''}`}
                  placeholder="Enter a category"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? "category-error" : undefined}
                />
                {errors.category && (
                  <p id="category-error" className="app-form-error mt-1" role="alert">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 accent-[var(--brand-primary)]"
                  aria-label="Pin this note"
                />
                <label htmlFor="isPinned" className="ml-2 text-sm font-medium text-[var(--text-secondary)]">
                  Pin this note
                </label>
              </div>
            </div>

            <div className="app-form-actions mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="app-button-secondary"
                aria-label="Cancel note creation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="app-button"
                aria-label={existingNote ? 'Save note changes' : 'Create new note'}
              >
                {existingNote ? 'Save Changes' : 'Create Note'}
              </button>
            </div>
          </form>
      </div>
    </AppModal>
  );
}
