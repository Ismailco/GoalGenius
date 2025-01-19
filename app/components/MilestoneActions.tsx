import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Milestone } from '@/app/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MilestoneActionsProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
  onToggleComplete: (milestone: Milestone) => void;
}

export default function MilestoneActions({
  milestone,
  onEdit,
  onDelete,
  onToggleComplete
}: MilestoneActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleComplete(milestone)}
        className={`hover:bg-gray-100 ${milestone.completed ? 'text-green-600' : ''}`}
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(milestone)}
        className="hover:bg-gray-100"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDeleteDialog(true)}
        className="hover:bg-red-100 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(milestone.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
