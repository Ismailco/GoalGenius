'use client';

import { useState } from 'react';
import { GoalCategory, TimeFrame } from '@/app/types';

interface GoalInputFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: GoalCategory;
    timeFrame: TimeFrame;
  }) => Promise<void>;
}

export default function GoalInputForm({ onSubmit }: GoalInputFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'health' as GoalCategory,
    timeFrame: 'short-term' as TimeFrame,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      category: 'HEALTH',
      timeFrame: 'SHORT_TERM',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as GoalCategory })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="health">Health</option>
          <option value="career">Career</option>
          <option value="learning">Learning</option>
          <option value="relationships">Relationships</option>
        </select>
      </div>

      <div>
        <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-700">
          Time Frame
        </label>
        <select
          id="timeFrame"
          value={formData.timeFrame}
          onChange={(e) => setFormData({ ...formData, timeFrame: e.target.value as TimeFrame })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="short-term">Short Term</option>
          <option value="medium-term">Medium Term</option>
          <option value="long-term">Long Term</option>
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Goal
      </button>
    </form>
  );
}
