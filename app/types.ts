export type GoalCategory = 'health' | 'career' | 'learning' | 'relationships';
export type TimeFrame = 'short-term' | 'medium-term' | 'long-term';
export type GoalStatus = 'not-started' | 'in-progress' | 'completed';

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

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description: string;
  date: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
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

// ... rest of the types ...
