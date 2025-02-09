'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/app/types';
import { createNote, updateNote } from '@/app/lib/storage';
import { validateAndSanitizeInput, ValidationResult } from '@/app/lib/validation';
import validator from 'validator';

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
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (existingNote) {
      setTitle(validator.unescape(existingNote.title));
      setContent(validator.unescape(existingNote.content));
      setCategory(existingNote.category ? validator.unescape(existingNote.category) : '');
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

  const handleSubmit = (e: React.FormEvent) => {
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
    };

    const savedNote = existingNote
      ? updateNote(existingNote.id, noteData)
      : createNote(noteData);

    onSave?.(savedNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/10 max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {existingNote ? 'Edit Note' : 'Create New Note'}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit}>
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
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
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
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
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
                  rows={8}
                  className={`w-full px-4 py-2 bg-white/10 border ${
                    errors.content ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  required
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200"
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
