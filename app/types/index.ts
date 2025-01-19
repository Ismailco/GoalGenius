export type GoalCategory = 'PERSONAL' | 'PROFESSIONAL' | 'HEALTH' | 'FINANCIAL' | 'EDUCATIONAL' | 'CAREER' | 'LEARNING' | 'RELATIONSHIPS';
export type TimeFrame = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Milestone {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  timeFrame: TimeFrame;
  status: GoalStatus;
  progress: number;
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

