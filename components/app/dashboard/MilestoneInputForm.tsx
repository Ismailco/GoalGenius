'use client';

import { useState } from 'react';
import { validateAndSanitizeInput, ValidationResult } from '@/lib/validation';

interface MilestoneInputFormProps {
  onSubmit: (data: { title: string; description: string; date: string }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    description: string;
    date: string;
  };
}

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
}

export default function MilestoneInputForm({ onSubmit, onCancel, initialData }: MilestoneInputFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'title':
        return validateAndSanitizeInput(value, 'title', true);
      case 'description':
        return validateAndSanitizeInput(value, 'description', true);
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
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
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
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
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
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="app-button-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="app-button"
        >
          {initialData ? 'Update' : 'Create'} Milestone
        </button>
      </div>
    </form>
  );
}
