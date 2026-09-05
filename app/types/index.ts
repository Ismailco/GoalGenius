export type TimeFrame = 'short-term' | 'medium-term' | 'long-term';
export type GoalCategory = 'health' | 'career' | 'learning' | 'relationships';
export type GoalStatus = 'not-started' | 'in-progress' | 'completed';
export type TodoRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type TodoReminder = 'none' | 'at_due' | '15m' | '1h' | '1d';

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  date: string;
  completed?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  timeFrame: TimeFrame;
  status: GoalStatus;
  progress: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    categories: GoalCategory[];
    focusAreas: string[];
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface Todo {
  id: string;
  goalId?: string | null;
  milestoneId?: string | null;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  recurrence: TodoRecurrence;
  reminder: TodoReminder;
  createdAt: string;
  updatedAt: string;
}

export interface TodoOccurrence {
  id: string;
  todoId: string;
  occurrenceDate: string;
  completedAt: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  goalId?: string | null;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  energy: 'high' | 'medium' | 'low';
  accomplishments: string[];
  challenges: string[];
  goals: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
