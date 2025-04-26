'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/app/types';
import { createNote, updateNote } from '@/app/lib/storage';
import { validateAndSanitizeInput, ValidationResult, unescapeForDisplay } from '@/app/lib/validation';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/app/lib/error';
import { LoadingOverlay } from './LoadingSpinner';

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

  useEffect(() => {
    if (existingNote) {
      setTitle(unescapeForDisplay(existingNote.title));
      setContent(unescapeForDisplay(existingNote.content));
      setCategory(existingNote.category ? unescapeForDisplay(existingNote.category) : '');
      setIsPinned(existingNote.isPinned || false);
    }
  }, [existingNote]);

  if (!isOpen) return null;

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'title':
        return validateAndSanitizeInput(value, 'title', true);
      case 'content':
        return validateAndSanitizeInput(value, 'description', true);
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
        const savedNote = existingNote
          ? updateNote(existingNote.id, noteData)
          : createNote(noteData);
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
    <div
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-labelledby="note-modal-title"
      aria-modal="true"
    >
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/10 max-h-[80vh] flex flex-col relative">
        {isLoading && <LoadingOverlay role="status" aria-label="Saving note..." />}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h2 id="note-modal-title" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {existingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} aria-label={existingNote ? 'Edit note form' : 'Create note form'}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-white/10 border ${
                    errors.title ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  required
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-2 bg-white/10 border ${
                    errors.content ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  required
                  aria-invalid={!!errors.content}
                  aria-describedby={errors.content ? "content-error" : undefined}
                />
                {errors.content && (
                  <p id="content-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.content}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category (optional)
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-white/10 border ${
                    errors.category ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  placeholder="Enter a category"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? "category-error" : undefined}
                />
                {errors.category && (
                  <p id="category-error" className="mt-1 text-sm text-red-500" role="alert">
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
                  className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500/50"
                  aria-label="Pin this note"
                />
                <label htmlFor="isPinned" className="ml-2 text-sm font-medium text-gray-300">
                  Pin this note
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Cancel note creation"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200"
                aria-label={existingNote ? 'Save note changes' : 'Create new note'}
              >
                {existingNote ? 'Save Changes' : 'Create Note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
