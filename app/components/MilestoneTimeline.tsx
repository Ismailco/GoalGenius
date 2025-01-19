'use client';

import { useEffect, useState } from 'react';
import { Milestone } from '@/app/types';
import MilestoneActions from './MilestoneActions';
import EditMilestoneDialog from './EditMilestoneDialog';
import CreateMilestoneModal from './CreateMilestoneModal';

export default function MilestoneTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const response = await fetch('/api/milestones');
      if (!response.ok) throw new Error('Failed to fetch milestones');
      const data = await response.json();
      setMilestones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      setError('Failed to load milestones');
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
  };

  const handleDelete = async (milestoneId: string) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete milestone');
      await fetchMilestones(); // Refresh the list
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const handleToggleComplete = async (milestone: Milestone) => {
    try {
      const response = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !milestone.completed }),
      });
      if (!response.ok) throw new Error('Failed to update milestone');
      await fetchMilestones(); // Refresh the list
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  if (loading) return <div className="animate-pulse">Loading milestones...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
        <CreateMilestoneModal onSuccess={fetchMilestones} />
      </div>

      {milestones.length === 0 ? (
        <p className="text-gray-500">No milestones yet. Add your first milestone!</p>
      ) : (
        <div className="border-l-2 border-indigo-200">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="ml-4 mb-10 relative">
              <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[25px] top-1.5" />
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start">
                  <div>
                    <time className="block text-sm text-gray-500 mb-1">
                      {new Date(milestone.date).toLocaleDateString()}
                    </time>
                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                    <p className="text-gray-600 mt-2">{milestone.description}</p>
                  </div>
                  <MilestoneActions
                    milestone={milestone}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingMilestone && (
        <EditMilestoneDialog
          milestone={editingMilestone}
          open={!!editingMilestone}
          onOpenChange={(open) => !open && setEditingMilestone(null)}
          onSuccess={fetchMilestones}
        />
      )}
    </div>
  );
}
