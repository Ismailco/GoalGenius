'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { GoalCategory, TimeFrame } from '@/app/types';
import { createGoal } from '@/app/lib/storage';
import AlertModal from './AlertModal';

interface SuggestedGoal {
  title: string;
  description: string;
  category: GoalCategory;
  timeFrame: string;
}

export default function GoalSuggestions() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('health');
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const suggestions: Record<GoalCategory, SuggestedGoal[]> = {
    health: [
      {
        title: 'Daily Exercise Routine',
        description: 'Exercise 30 minutes daily to improve fitness and energy levels',
        category: 'health',
        timeFrame: '3 months'
      },
      {
        title: 'Balanced Diet Plan',
        description: 'Maintain a balanced diet with proper nutrition and meal planning',
        category: 'health',
        timeFrame: '6 months'
      },
      {
        title: 'Sleep Schedule',
        description: 'Get 8 hours of sleep daily by maintaining a consistent sleep schedule',
        category: 'health',
        timeFrame: '1 month'
      },
      {
        title: 'Meditation Practice',
        description: 'Practice daily meditation for mental wellness and stress reduction',
        category: 'health',
        timeFrame: '2 months'
      }
    ],
    career: [
      {
        title: 'Professional Skill Development',
        description: 'Learn a new professional skill through online courses and practice',
        category: 'career',
        timeFrame: '6 months'
      },
      {
        title: 'Networking Growth',
        description: 'Network with industry peers and attend professional events',
        category: 'career',
        timeFrame: '3 months'
      },
      {
        title: 'Certification Achievement',
        description: 'Complete an industry-recognized certification course',
        category: 'career',
        timeFrame: '4 months'
      },
      {
        title: 'Leadership Development',
        description: 'Improve leadership skills through workshops and practical experience',
        category: 'career',
        timeFrame: '6 months'
      }
    ],
    learning: [
      {
        title: 'Reading Challenge',
        description: 'Read 20 books this year across various genres',
        category: 'learning',
        timeFrame: '12 months'
      },
      {
        title: 'Language Learning',
        description: 'Learn a new language to conversational level',
        category: 'learning',
        timeFrame: '6 months'
      },
      {
        title: 'Technology Mastery',
        description: 'Master a new technology or programming language',
        category: 'learning',
        timeFrame: '4 months'
      },
      {
        title: 'Online Course Completion',
        description: 'Complete selected online courses in your field of interest',
        category: 'learning',
        timeFrame: '3 months'
      }
    ],
    relationships: [
      {
        title: 'Family Time',
        description: 'Plan and execute weekly family activities',
        category: 'relationships',
        timeFrame: 'ongoing'
      },
      {
        title: 'Friend Reconnection',
        description: 'Reconnect with old friends through regular catch-ups',
        category: 'relationships',
        timeFrame: '2 months'
      },
      {
        title: 'Communication Enhancement',
        description: 'Improve communication skills in personal relationships',
        category: 'relationships',
        timeFrame: '3 months'
      },
      {
        title: 'Community Engagement',
        description: 'Join and actively participate in community groups',
        category: 'relationships',
        timeFrame: '6 months'
      }
    ]
  };

  const handleAddGoal = async (suggestion: SuggestedGoal) => {
    try {
      await createGoal({
        ...suggestion,
        progress: 0,
        status: 'not-started',
        timeFrame: suggestion.timeFrame as TimeFrame,
        category: suggestion.category as GoalCategory,
      });
      setAlert({
        show: true,
        title: 'Success',
        message: 'Goal added successfully!',
        type: 'success'
      });
    } catch (error) {
      setAlert({
				show: true,
				title: 'Error',
				message: error instanceof Error ? error.message : 'Failed to add goal. Please try again.',
				type: 'error',
			});
    }
  };

  const modal = isOpen ? (
    <div className="fixed inset-0 z-[9999]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Goal Suggestions</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {Object.keys(suggestions).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as GoalCategory)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 gap-4">
            {suggestions[selectedCategory].map((suggestion, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{suggestion.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{suggestion.description}</p>
                      <span className="text-sm text-gray-500 mt-2 block">Timeline: {suggestion.timeFrame}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddGoal(suggestion)}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm hover:from-blue-600 hover:to-purple-600 transition-colors"
                  >
                    Add Goal
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-full text-white bg-white/5 hover:bg-white/10 backdrop-blur-lg transform hover:scale-105 transition-all duration-200"
      >
        <svg
          className="w-5 h-5 mr-2 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Get Ideas
      </button>
      {typeof document !== 'undefined' && createPortal(modal, document.body)}

      {alert.show && (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </>
  );
}
