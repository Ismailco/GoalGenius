'use client';

import { useState } from 'react';
import { Milestone } from '@/app/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/components/ui/use-toast";

interface EditMilestoneDialogProps {
  milestone: Milestone;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

export default function EditMilestoneDialog({
  milestone,
  open,
  onOpenChange,
  onSuccess
}: EditMilestoneDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    title: milestone.title,
    description: milestone.description,
    date: milestone.date,
    completed: milestone.completed,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update milestone');
      }

      toast({
        title: "Success",
        description: "Milestone updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update milestone',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Milestone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="date">Target Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={formData.completed}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, completed: checked as boolean })
              }
              disabled={loading}
            />
            <Label
              htmlFor="completed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as completed
            </Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⭮</span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
