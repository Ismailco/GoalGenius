'use client';

import { useState } from 'react';
import { GoalCategory, TimeFrame } from '@/app/types';
import { validateAndSanitizeInput, ValidationResult } from '@/app/lib/validation';

interface GoalInputFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: GoalCategory;
    timeFrame: TimeFrame;
  }) => Promise<void>;
  onCancel?: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export default function GoalInputForm({ onSubmit, onCancel }: GoalInputFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'health' as GoalCategory,
    timeFrame: 'short-term' as TimeFrame,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'title':
        return validateAndSanitizeInput(value, 'title', true);
      case 'description':
        return validateAndSanitizeInput(value, 'description', false);
      default:
        return { isValid: true, sanitizedValue: value };
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Validate and sanitize the input
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const titleValidation = validateField('title', formData.title);
    const descriptionValidation = validateField('description', formData.description);

    const newErrors: FormErrors = {};
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error;
    }
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error;
    }

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit sanitized data
    await onSubmit({
      ...formData,
      title: titleValidation.sanitizedValue,
      description: descriptionValidation.sanitizedValue,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-white">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-200">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full px-4 py-2 bg-white/5 border ${
            errors.title ? 'border-red-500' : 'border-white/10'
          } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          placeholder="Enter goal title"
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-200">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full px-4 py-2 bg-white/5 border ${
            errors.description ? 'border-red-500' : 'border-white/10'
          } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          placeholder="Describe your goal"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-200">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="health">Health</option>
          <option value="career">Career</option>
          <option value="learning">Learning</option>
          <option value="relationships">Relationships</option>
        </select>
      </div>

      <div>
        <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-200">
          Time Frame
        </label>
        <select
          id="timeFrame"
          name="timeFrame"
          value={formData.timeFrame}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="short-term">Short Term (1-3 months)</option>
          <option value="medium-term">Medium Term (3-6 months)</option>
          <option value="long-term">Long Term (6+ months)</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200"
        >
          Create Goal
        </button>
      </div>
    </form>
  );
}
