'use client';

import { useState } from 'react';
import { validateAndSanitizeInput, ValidationResult } from '@/lib/validation';
import { todayDateOnly } from '@/lib/domain/date-only';

interface MilestoneInputFormProps {
  onSubmit: (data: { title: string; description: string; date: string }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    description: string;
    date: string;
  };
  isSubmitting?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
}

export default function MilestoneInputForm({ onSubmit, onCancel, initialData, isSubmitting = false }: MilestoneInputFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || todayDateOnly(),
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'title':
        return validateAndSanitizeInput(value, 'title', true);
      case 'description':
        return validateAndSanitizeInput(value, 'description', false);
      case 'date':
        return validateAndSanitizeInput(value, 'date', true);
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
    setFormData(prev => ({
      ...prev,
      [name]: validationResult.sanitizedValue
    }));

    // Update errors
    setErrors(prev => ({
      ...prev,
      [name]: validationResult.error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const titleValidation = validateField('title', formData.title);
    const descriptionValidation = validateField('description', formData.description);
    const dateValidation = validateField('date', formData.date);

    const newErrors: FormErrors = {};
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error;
    }
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error;
    }
    if (!dateValidation.isValid) {
      newErrors.date = dateValidation.error;
    }

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: titleValidation.sanitizedValue,
      description: descriptionValidation.sanitizedValue,
      date: dateValidation.sanitizedValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`app-field ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Enter milestone title"
          required
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'milestone-title-error' : undefined}
        />
        {errors.title && (
          <p id="milestone-title-error" className="app-form-error mt-1" role="alert">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`app-field ${errors.description ? 'border-red-500' : ''}`}
          rows={3}
          placeholder="Enter milestone description"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'milestone-description-error' : undefined}
        />
        {errors.description && (
          <p id="milestone-description-error" className="app-form-error mt-1" role="alert">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
          Target Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`app-field ${errors.date ? 'border-red-500' : ''}`}
          required
          min={todayDateOnly()}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'milestone-date-error' : undefined}
        />
        {errors.date && (
          <p id="milestone-date-error" className="app-form-error mt-1" role="alert">{errors.date}</p>
        )}
      </div>

      <div className="app-form-actions mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="app-button-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="app-button"
        >
          {initialData ? 'Update' : 'Create'} Milestone
        </button>
      </div>
    </form>
  );
}
