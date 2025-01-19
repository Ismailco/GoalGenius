'use client';

import { useState } from 'react';
import { Goal, GoalCategory, TimeFrame } from '@/app/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface EditGoalDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  title: string;
  description: string;
  category: GoalCategory;
  timeFrame: TimeFrame;
  progress: number;
}

export default function EditGoalDialog({ goal, open, onOpenChange }: EditGoalDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    title: goal.title,
    description: goal.description,
    category: goal.category,
    timeFrame: goal.timeFrame,
    progress: goal.progress,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update goal');

      window.location.reload(); // Refresh to show updates
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as GoalCategory })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="PERSONAL">Personal</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="HEALTH">Health</option>
              <option value="FINANCIAL">Financial</option>
              <option value="EDUCATIONAL">Educational</option>
            </select>
          </div>
          <div>
            <Label htmlFor="timeFrame">Time Frame</Label>
            <select
              id="timeFrame"
              value={formData.timeFrame}
              onChange={(e) => setFormData({ ...formData, timeFrame: e.target.value as TimeFrame })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="SHORT_TERM">Short Term</option>
              <option value="MEDIUM_TERM">Medium Term</option>
              <option value="LONG_TERM">Long Term</option>
            </select>
          </div>
          <div>
            <Label htmlFor="progress">Progress ({formData.progress}%)</Label>
            <Input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
            />
            <Progress value={formData.progress} className="h-2 mt-2" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
