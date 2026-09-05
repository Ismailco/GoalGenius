'use client';

import { useState, useEffect, useRef } from 'react';
import { Todo, TodoRecurrence, TodoReminder } from '@/app/types';
import { readAppSettings } from '@/lib/app-settings';
import { createTodo, updateTodo } from '@/lib/storage';
import { validateAndSanitizeInput, ValidationResult, unescapeForDisplay } from '@/lib/validation';
import { handleAsyncOperation, getUserFriendlyErrorMessage } from '@/lib/error';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTodo?: Todo;
  onSave?: (todo: Todo) => void;
  goalId?: string | null;
  milestoneId?: string | null;
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
  goalId = null,
  milestoneId = null,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    readAppSettings().defaultTodoPriority
  );
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [recurrence, setRecurrence] = useState<TodoRecurrence>('none');
  const [reminder, setReminder] = useState<TodoReminder>('none');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !isLoading) onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }

    return undefined;
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (existingTodo) {
      setTitle(unescapeForDisplay(existingTodo.title));
      setDescription(existingTodo.description ? unescapeForDisplay(existingTodo.description) : '');
      setPriority(existingTodo.priority);
      setDueDate(existingTodo.dueDate || '');
      setCategory(existingTodo.category ? unescapeForDisplay(existingTodo.category) : '');
      setRecurrence(existingTodo.recurrence ?? 'none');
      setReminder(existingTodo.reminder ?? 'none');
      setErrors({});
      return;
    }

    const settings = readAppSettings();
    setTitle('');
    setDescription('');
    setPriority(settings.defaultTodoPriority);
    setDueDate('');
    setCategory('');
    setRecurrence('none');
    setReminder('none');
    setErrors({});
  }, [existingTodo, isOpen]);

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
      case 'recurrence':
        setRecurrence(value as TodoRecurrence);
        break;
      case 'reminder':
        setReminder(value as TodoReminder);
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
      goalId: goalId ?? existingTodo?.goalId ?? null,
      milestoneId: milestoneId ?? existingTodo?.milestoneId ?? null,
      title: titleValidation.sanitizedValue,
      description: descriptionValidation.sanitizedValue || undefined,
      priority: priority as 'low' | 'medium' | 'high',
      dueDate: dueDateValidation.sanitizedValue || undefined,
      category: categoryValidation.sanitizedValue || undefined,
      recurrence,
      reminder: dueDate ? reminder : 'none',
    };

    await handleAsyncOperation(
      async () => {
        const savedTodo = await (existingTodo
          ? updateTodo(existingTodo.id, todoData)
          : createTodo(todoData));
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
      ref={modalRef}
      className="app-modal-backdrop"
      role="dialog"
      aria-labelledby="todo-modal-title"
      aria-modal="true"
    >
      <div className="app-modal-panel relative flex max-h-[80vh] flex-col">
        {isLoading && <LoadingOverlay role="status" aria-label="Saving task..." />}
        <div className="shrink-0 border-b border-white/5 p-6">
          <h2 id="todo-modal-title" className="text-2xl font-semibold text-white">
            {existingTodo ? 'Edit Task' : 'Create New Task'}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} aria-label={existingTodo ? 'Edit task form' : 'Create task form'}>
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
                  <p id="title-error" className="mt-1 text-sm text-red-500" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={handleChange}
                  rows={3}
                  className={`app-field ${errors.description ? 'border-red-500' : ''}`}
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
                  <label htmlFor="priority" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={priority}
                    onChange={handleChange}
                    className="app-select"
                    aria-label="Select task priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="recurrence" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Repeat
                  </label>
                  <select id="recurrence" name="recurrence" value={recurrence} onChange={handleChange} className="app-select">
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reminder" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Reminder
                  </label>
                  <select id="reminder" name="reminder" value={reminder} onChange={handleChange} className="app-select" disabled={!dueDate}>
                    <option value="none">No reminder</option>
                    <option value="at_due">At due date</option>
                    <option value="15m">15 minutes before</option>
                    <option value="1h">1 hour before</option>
                    <option value="1d">1 day before</option>
                  </select>
                  {!dueDate ? <p className="mt-1 text-xs text-[var(--text-muted)]">Add a due date to set a reminder.</p> : null}
                </div>

                <div>
                  <label htmlFor="dueDate" className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                    Due Date (optional)
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={dueDate}
                    onChange={handleChange}
                    className={`app-field ${errors.dueDate ? 'border-red-500' : ''}`}
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
                disabled={isLoading}
                className="app-button-secondary"
                aria-label="Cancel task creation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="app-button"
                aria-label={existingTodo ? 'Save task changes' : 'Create new task'}
              >
                {existingTodo ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
