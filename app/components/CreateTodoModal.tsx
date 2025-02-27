'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/app/types';
import { createTodo, updateTodo } from '@/app/lib/storage';
import { validateAndSanitizeInput, ValidationResult, unescapeForDisplay } from '@/app/lib/validation';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/app/lib/error';
import { LoadingOverlay } from './LoadingSpinner';

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTodo?: Todo;
  onSave?: (todo: Todo) => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string;
}

export default function CreateTodoModal({
  isOpen,
  onClose,
  existingTodo,
  onSave,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingTodo) {
      setTitle(unescapeForDisplay(existingTodo.title));
      setDescription(existingTodo.description ? unescapeForDisplay(existingTodo.description) : '');
      setPriority(existingTodo.priority);
      setDueDate(existingTodo.dueDate || '');
      setCategory(existingTodo.category ? unescapeForDisplay(existingTodo.category) : '');
    }
  }, [existingTodo]);

  if (!isOpen) return null;

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'title':
        return validateAndSanitizeInput(value, 'title', true);
      case 'description':
        return validateAndSanitizeInput(value, 'description', false);
      case 'category':
        return validateAndSanitizeInput(value, 'category', false);
      case 'dueDate':
        return validateAndSanitizeInput(value, 'date', false);
      default:
        return { isValid: true, sanitizedValue: value };
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const validationResult = validateField(name, value);

    // Update the form data with sanitized value
    switch (name) {
      case 'title':
        setTitle(validationResult.sanitizedValue);
        break;
      case 'description':
        setDescription(validationResult.sanitizedValue);
        break;
      case 'category':
        setCategory(validationResult.sanitizedValue);
        break;
      case 'dueDate':
        setDueDate(validationResult.sanitizedValue);
        break;
      case 'priority':
        setPriority(value as 'low' | 'medium' | 'high');
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
    const descriptionValidation = validateField('description', description);
    const categoryValidation = validateField('category', category);
    const dueDateValidation = validateField('dueDate', dueDate);

    const newErrors: FormErrors = {};
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error;
    }
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error;
    }
    if (!categoryValidation.isValid) {
      newErrors.category = categoryValidation.error;
    }
    if (!dueDateValidation.isValid) {
      newErrors.dueDate = dueDateValidation.error;
    }

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const todoData = {
      title: titleValidation.sanitizedValue,
      description: descriptionValidation.sanitizedValue || undefined,
      priority: priority as 'low' | 'medium' | 'high',
      dueDate: dueDateValidation.sanitizedValue || undefined,
      category: categoryValidation.sanitizedValue || undefined,
    };

    await handleAsyncOperation(
      async () => {
        const savedTodo = existingTodo
          ? updateTodo(existingTodo.id, todoData)
          : createTodo(todoData);
        onSave?.(savedTodo);
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
      aria-labelledby="todo-modal-title"
      aria-modal="true"
    >
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/10 max-h-[80vh] flex flex-col relative">
        {isLoading && <LoadingOverlay role="status" aria-label="Saving todo..." />}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <h2 id="todo-modal-title" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {existingTodo ? 'Edit Todo' : 'Create New Todo'}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} aria-label={existingTodo ? 'Edit todo form' : 'Create todo form'}>
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 bg-white/10 border ${
                    errors.description ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    aria-label="Select task priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date (optional)
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={dueDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 bg-white/10 border ${
                      errors.dueDate ? 'border-red-500' : 'border-white/20'
                    } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    aria-invalid={!!errors.dueDate}
                    aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
                  />
                  {errors.dueDate && (
                    <p id="dueDate-error" className="mt-1 text-sm text-red-500" role="alert">
                      {errors.dueDate}
                    </p>
                  )}
                </div>
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
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Cancel todo creation"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200"
                aria-label={existingTodo ? 'Save todo changes' : 'Create new todo'}
              >
                {existingTodo ? 'Save Changes' : 'Create Todo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
