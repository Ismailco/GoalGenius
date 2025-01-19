'use client';

import { useState, useEffect } from 'react';
import { Goal, Milestone } from '@/app/types';
import { Lightbulb } from 'lucide-react';

export default function GoalSuggestions() {
  const [suggestions, setSuggestions] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentGoals, setCurrentGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [hasEnoughContext, setHasEnoughContext] = useState(false);

  useEffect(() => {
    // Fetch initial data
    fetchUserContext();
  }, []);

  // Check if we have enough context to make meaningful suggestions
  useEffect(() => {
    setHasEnoughContext(currentGoals.length > 0 || milestones.length > 0);
  }, [currentGoals, milestones]);

  const fetchUserContext = async () => {
    try {
      // Fetch current goals
      const goalsResponse = await fetch('/api/goals');
      const goalsData = await goalsResponse.json();
      setCurrentGoals(Array.isArray(goalsData) ? goalsData : []);

      // Fetch milestones
      const milestonesResponse = await fetch('/api/milestones');
      const milestonesData = await milestonesResponse.json();
      setMilestones(Array.isArray(milestonesData) ? milestonesData : []);
    } catch (error) {
      console.error('Error fetching user context:', error);
    }
  };

  const fetchSuggestions = async () => {
    if (!hasEnoughContext) return;

    setLoading(true);
    try {
      const preferences = {
        categories: ['health', 'career', 'learning'],
        focusAreas: ['personal growth', 'professional development']
      };

      const response = await fetch('/api/goals/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          currentGoals,
          milestones
        })
      });

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={fetchSuggestions}
        disabled={!hasEnoughContext || loading}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          hasEnoughContext && !loading
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={
          !hasEnoughContext
            ? "Add some goals or milestones first to get personalized suggestions"
            : "Get AI-powered goal suggestions"
        }
      >
        <Lightbulb size={18} />
        {loading ? 'Generating...' : 'Get AI Suggestions'}
      </button>

      {!hasEnoughContext && (
        <div className="mt-6 text-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Ready for Smart Goal Suggestions?
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Start by adding a few goals or milestones. Our AI will analyze your progress
                and suggest personalized next steps for your journey.
              </p>
            </div>
            <button
              onClick={() => {/* Add logic to open create goal modal */}}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:border-indigo-200 transition-colors"
            >
              <h3 className="font-semibold">{suggestion.title}</h3>
              <p className="text-gray-600">{suggestion.description}</p>
              <div className="mt-2 flex gap-2">
                <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                  {suggestion.category}
                </span>
                <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {suggestion.timeFrame}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
