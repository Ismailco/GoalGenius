import { Goal, Milestone, Note, Todo, CheckIn } from '@/app/types';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeForStorage } from '@/app/lib/validation';
import validator from 'validator';

// Helper function to sanitize data before storage
const sanitizeData = <T extends Record<string, unknown>>(data: T): T => {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      sanitized[key] = value.map(item => typeof item === 'string' ? sanitizeForStorage(item) : item);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeForStorage(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
};

// Helper function to unescape data when retrieving
const unescapeData = <T extends Record<string, unknown>>(data: T): T => {
  const unescaped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      unescaped[key] = value.map(item => typeof item === 'string' ? validator.unescape(item) : item);
    } else if (typeof value === 'string') {
      unescaped[key] = validator.unescape(value);
    } else {
      unescaped[key] = value;
    }
  }
  return unescaped as T;
};

const STORAGE_KEYS = {
  GOALS: 'goals',
  MILESTONES: 'milestones',
  NOTES: 'notes',
  TODOS: 'todos',
  CHECKINS: 'checkins',
};

export function getGoals(): Goal[] {
  if (typeof window === 'undefined') return [];
  const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
  return goals.map((goal: Record<string, unknown>) => unescapeData(goal));
}

export function getGoal(id: string): Goal | null {
  const goals = getGoals();
  return goals.find(goal => goal.id === id) || null;
}

export function createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
  const goals = getGoals();
  const sanitizedGoal = sanitizeData(goal);
  const newGoal: Goal = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: sanitizedGoal.title,
    description: sanitizedGoal.description,
    category: sanitizedGoal.category,
    timeFrame: sanitizedGoal.timeFrame,
    status: sanitizedGoal.status,
    progress: sanitizedGoal.progress,
  };
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([...goals, newGoal]));
  return unescapeData(newGoal as unknown as Record<string, unknown>) as unknown as Goal;
}

export function updateGoal(id: string, updates: Partial<Goal>): Goal {
  const goals = getGoals();
  const sanitizedUpdates = sanitizeData(updates);
  const updatedGoals = goals.map(goal => {
    if (goal.id === id) {
      return { ...goal, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    }
    return goal;
  });
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
  return unescapeData(updatedGoals.find(g => g.id === id)! as unknown as Record<string, unknown>) as unknown as Goal;
}

export function deleteGoal(id: string): boolean {
  const goals = getGoals();
  const filtered = goals.filter(goal => goal.id !== id);
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
  return true;
}

export function getMilestones(): Milestone[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.MILESTONES);
  const milestones = stored ? JSON.parse(stored) : [];
  return milestones.map((milestone: Record<string, unknown>) => unescapeData(milestone));
}

export function getMilestone(id: string): Milestone | null {
  const milestones = getMilestones();
  return milestones.find(milestone => milestone.id === id) || null;
}

export function createMilestone(milestone: Omit<Milestone, 'id'>): Milestone {
  const milestones = getMilestones();
  const sanitizedMilestone = sanitizeData(milestone);
  const newMilestone: Milestone = {
    id: crypto.randomUUID(),
    goalId: sanitizedMilestone.goalId,
    title: sanitizedMilestone.title,
    description: sanitizedMilestone.description,
    date: sanitizedMilestone.date
  };

  milestones.push(newMilestone);
  localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  return unescapeData(newMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
}

export function updateMilestone(id: string, updates: Partial<Milestone>): Milestone {
  const milestones = getMilestones();
  const index = milestones.findIndex(milestone => milestone.id === id);

  if (index === -1) throw new Error('Milestone not found');

  const sanitizedUpdates = sanitizeData(updates);
  const updatedMilestone = {
    ...milestones[index],
    ...sanitizedUpdates,
  };

  milestones[index] = updatedMilestone;
  localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  return unescapeData(updatedMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
}

export function deleteMilestone(id: string): boolean {
  const milestones = getMilestones();
  const filtered = milestones.filter(milestone => milestone.id !== id);
  localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(filtered));
  return true;
}

export function getNotes(): Note[] {
  const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
  return notes.map((note: Record<string, unknown>) => unescapeData(note));
}

export function getNote(id: string): Note | null {
  const notes = getNotes();
  return notes.find(note => note.id === id) || null;
}

export function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const notes = getNotes();
  const sanitizedNote = sanitizeData(note);
  const newNote: Note = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: sanitizedNote.title,
    content: sanitizedNote.content,
    category: sanitizedNote.category,
    isPinned: sanitizedNote.isPinned || false,
  };
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([...notes, newNote]));
  return unescapeData(newNote as unknown as Record<string, unknown>) as unknown as Note;
}

export function updateNote(id: string, updates: Partial<Note>): Note {
  const notes = getNotes();
  const sanitizedUpdates = sanitizeData(updates);
  const updatedNotes = notes.map(note => {
    if (note.id === id) {
      return { ...note, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    }
    return note;
  });
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
  return unescapeData(updatedNotes.find(n => n.id === id)! as unknown as Record<string, unknown>) as unknown as Note;
}

export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const filtered = notes.filter(note => note.id !== id);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
  return true;
}

export function getTodos(): Todo[] {
  if (typeof window === 'undefined') return [];
  const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
  return todos.map((todo: Record<string, unknown>) => unescapeData(todo));
}

export function getTodo(id: string): Todo | null {
  const todos = getTodos();
  return todos.find(todo => todo.id === id) || null;
}

export function createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Todo {
  const todos = getTodos();
  const sanitizedTodo = sanitizeData(todo);
  const newTodo: Todo = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completed: false,
    title: sanitizedTodo.title,
    description: sanitizedTodo.description,
    priority: sanitizedTodo.priority,
    dueDate: sanitizedTodo.dueDate,
    category: sanitizedTodo.category,
  };

  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify([...todos, newTodo]));
  return unescapeData(newTodo as unknown as Record<string, unknown>) as unknown as Todo;
}

export function updateTodo(id: string, updates: Partial<Todo>): Todo {
  const todos = getTodos();
  const sanitizedUpdates = sanitizeData(updates);
  const updatedTodos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    }
    return todo;
  });
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(updatedTodos));
  return unescapeData(updatedTodos.find(t => t.id === id)! as unknown as Record<string, unknown>) as unknown as Todo;
}

export function deleteTodo(id: string): boolean {
  const todos = getTodos();
  const filtered = todos.filter(todo => todo.id !== id);
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(filtered));
  return true;
}

export function toggleTodoComplete(id: string): Todo {
  const todo = getTodo(id);
  if (!todo) throw new Error('Todo not found');
  return updateTodo(id, { completed: !todo.completed });
}

export function getCheckIns(): CheckIn[] {
  if (typeof window === 'undefined') return [];
  const checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
  return checkIns.map((checkIn: Record<string, unknown>) => unescapeData(checkIn));
}

export function getCheckIn(id: string): CheckIn | null {
  const checkIns = getCheckIns();
  return checkIns.find(checkIn => checkIn.id === id) || null;
}

export function getCheckInByDate(date: string): CheckIn | null {
  const checkIns = getCheckIns();
  return checkIns.find(checkIn => checkIn.date === date) || null;
}

export function createCheckIn(checkIn: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>): CheckIn {
  const checkIns = getCheckIns();
  const sanitizedCheckIn = sanitizeData(checkIn);
  const newCheckIn: CheckIn = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: sanitizedCheckIn.date,
    mood: sanitizedCheckIn.mood,
    energy: sanitizedCheckIn.energy,
    accomplishments: sanitizedCheckIn.accomplishments,
    challenges: sanitizedCheckIn.challenges,
    goals: sanitizedCheckIn.goals,
    notes: sanitizedCheckIn.notes,
  };

  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify([...checkIns, newCheckIn]));
  return unescapeData(newCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
}

export function updateCheckIn(id: string, updates: Partial<CheckIn>): CheckIn {
  const checkIns = getCheckIns();
  const sanitizedUpdates = sanitizeData(updates);
  const updatedCheckIns = checkIns.map(checkIn => {
    if (checkIn.id === id) {
      return { ...checkIn, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    }
    return checkIn;
  });
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(updatedCheckIns));
  return unescapeData(updatedCheckIns.find(c => c.id === id)! as unknown as Record<string, unknown>) as unknown as CheckIn;
}

export function deleteCheckIn(id: string): boolean {
  const checkIns = getCheckIns();
  const filtered = checkIns.filter(checkIn => checkIn.id !== id);
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(filtered));
  return true;
}
