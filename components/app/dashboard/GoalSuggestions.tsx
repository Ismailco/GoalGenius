'use client';

import { useState } from 'react';
import { Lightbulb, Zap } from 'lucide-react';
import type { Goal, GoalCategory, TimeFrame } from '@/app/types';
import AppModal from '@/components/app/shared/AppModal';
import AlertModal from '@/components/common/AlertModal';
import { createGoal } from '@/lib/storage';

interface SuggestedGoal {
  title: string;
  description: string;
  category: GoalCategory;
  timeFrame: TimeFrame;
  timeline: string;
}

const CATEGORIES: GoalCategory[] = ['health', 'career', 'learning', 'relationships'];

const SUGGESTIONS: Record<GoalCategory, SuggestedGoal[]> = {
  health: [
    {
      title: 'Daily Exercise Routine',
      description: 'Exercise 30 minutes daily to improve fitness and energy levels',
      category: 'health',
      timeFrame: 'short-term',
      timeline: '3 months',
    },
    {
      title: 'Balanced Diet Plan',
      description: 'Maintain a balanced diet with proper nutrition and meal planning',
      category: 'health',
      timeFrame: 'medium-term',
      timeline: '6 months',
    },
    {
      title: 'Sleep Schedule',
      description: 'Get 8 hours of sleep daily by maintaining a consistent sleep schedule',
      category: 'health',
      timeFrame: 'short-term',
      timeline: '1 month',
    },
    {
      title: 'Meditation Practice',
      description: 'Practice daily meditation for mental wellness and stress reduction',
      category: 'health',
      timeFrame: 'short-term',
      timeline: '2 months',
    },
  ],
  career: [
    {
      title: 'Professional Skill Development',
      description: 'Learn a new professional skill through online courses and practice',
      category: 'career',
      timeFrame: 'medium-term',
      timeline: '6 months',
    },
    {
      title: 'Networking Growth',
      description: 'Network with industry peers and attend professional events',
      category: 'career',
      timeFrame: 'short-term',
      timeline: '3 months',
    },
    {
      title: 'Certification Achievement',
      description: 'Complete an industry-recognized certification course',
      category: 'career',
      timeFrame: 'short-term',
      timeline: '4 months',
    },
    {
      title: 'Leadership Development',
      description: 'Improve leadership skills through workshops and practical experience',
      category: 'career',
      timeFrame: 'medium-term',
      timeline: '6 months',
    },
  ],
  learning: [
    {
      title: 'Reading Challenge',
      description: 'Read 20 books this year across various genres',
      category: 'learning',
      timeFrame: 'long-term',
      timeline: '12 months',
    },
    {
      title: 'Language Learning',
      description: 'Learn a new language to conversational level',
      category: 'learning',
      timeFrame: 'medium-term',
      timeline: '6 months',
    },
    {
      title: 'Technology Mastery',
      description: 'Master a new technology or programming language',
      category: 'learning',
      timeFrame: 'short-term',
      timeline: '4 months',
    },
    {
      title: 'Online Course Completion',
      description: 'Complete selected online courses in your field of interest',
      category: 'learning',
      timeFrame: 'short-term',
      timeline: '3 months',
    },
  ],
  relationships: [
    {
      title: 'Family Time',
      description: 'Plan and execute weekly family activities',
      category: 'relationships',
      timeFrame: 'long-term',
      timeline: 'Ongoing',
    },
    {
      title: 'Friend Reconnection',
      description: 'Reconnect with old friends through regular catch-ups',
      category: 'relationships',
      timeFrame: 'short-term',
      timeline: '2 months',
    },
    {
      title: 'Communication Enhancement',
      description: 'Improve communication skills in personal relationships',
      category: 'relationships',
      timeFrame: 'short-term',
      timeline: '3 months',
    },
    {
      title: 'Community Engagement',
      description: 'Join and actively participate in community groups',
      category: 'relationships',
      timeFrame: 'medium-term',
      timeline: '6 months',
    },
  ],
};

interface GoalSuggestionsProps {
  onCreated?: (goal: Goal) => void | Promise<void>;
  label?: string;
}

export default function GoalSuggestions({
  onCreated,
  label = 'Get ideas',
}: GoalSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('health');
  const [addingGoalTitle, setAddingGoalTitle] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
  });

  const handleAddGoal = async (suggestion: SuggestedGoal) => {
    if (addingGoalTitle) return;

    setAddingGoalTitle(suggestion.title);
    try {
      const createdGoal = await createGoal({
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        timeFrame: suggestion.timeFrame,
        progress: 0,
        status: 'not-started',
      });
      setIsOpen(false);
      window.addNotification?.({
        title: 'Goal added',
        message: 'Your new goal is ready to use.',
        type: 'success',
      });
      await onCreated?.(createdGoal);
    } catch (error) {
      setAlert({
        show: true,
        title: 'Goal could not be added',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setAddingGoalTitle(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="app-button-secondary shrink-0 whitespace-nowrap"
        aria-haspopup="dialog"
      >
        <Lightbulb className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
        {label}
      </button>

      {isOpen ? (
        <AppModal
          title="Goal ideas"
          description="Choose a starting point, then tailor it to your routine."
          onClose={() => setIsOpen(false)}
          size="lg"
          closeDisabled={Boolean(addingGoalTitle)}
        >
          <div className="space-y-5">
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Goal categories">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'border-[var(--brand-border)] bg-[var(--brand-subtle)] text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {SUGGESTIONS[selectedCategory].map((suggestion) => (
                <article key={suggestion.title} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="icon-chip h-10 w-10 shrink-0 rounded-[16px]">
                        <Zap className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-[var(--text-primary)]">{suggestion.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{suggestion.description}</p>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">Timeline: {suggestion.timeline}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleAddGoal(suggestion)}
                      disabled={Boolean(addingGoalTitle)}
                      className="app-button shrink-0 !px-4 !py-2"
                    >
                      {addingGoalTitle === suggestion.title ? 'Adding…' : 'Add goal'}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="app-modal-footer flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={Boolean(addingGoalTitle)}
                className="app-button-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </AppModal>
      ) : null}

      {alert.show ? (
        <AlertModal
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert((currentAlert) => ({ ...currentAlert, show: false }))}
        />
      ) : null}
    </>
  );
}
