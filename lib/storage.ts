import { Goal, Milestone, Note, Todo, CheckIn } from '@/app/types';
// import { v4 as uuidv4 } from 'uuid';
import { sanitizeForStorage } from '@/lib/validation';
import validator from 'validator';
import { StorageError, ValidationError, logError } from './error';

// Helper function to check online status
function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

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

// Add this helper function at the top with the other helpers
function ensureJsonString(value: string[] | string | undefined | null): string {
  if (!value) return '[]';
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  // If it's already a string, validate it's a JSON array
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      throw new Error('Not an array');
    }
    return value; // Return original string if it's valid
  } catch {
    return '[]'; // Return empty array if invalid
  }
}

const STORAGE_KEYS = {
  GOALS: 'goals',
  MILESTONES: 'milestones',
  NOTES: 'notes',
  TODOS: 'todos',
  CHECKINS: 'checkins',
  USER_ID: 'userId',
};

function getScopedKey(baseKey: string, userId: string): string {
  return `${baseKey}:${userId}`;
}

function readCacheValue(baseKey: string, userId: string | null): string | null {
  if (!userId) return null;

  const scopedKey = getScopedKey(baseKey, userId);
  const scopedValue = localStorage.getItem(scopedKey);
  if (scopedValue !== null) return scopedValue;

  const legacyValue = localStorage.getItem(baseKey);
  if (legacyValue !== null) {
    localStorage.setItem(scopedKey, legacyValue);
    localStorage.removeItem(baseKey);
    return legacyValue;
  }

  return null;
}

function writeCacheValue(baseKey: string, userId: string | null, value: string): void {
  if (!userId) return;
  localStorage.setItem(getScopedKey(baseKey, userId), value);
  localStorage.removeItem(baseKey);
}

function removeCacheValue(baseKey: string, userId: string | null): void {
  if (!userId) return;
  localStorage.removeItem(getScopedKey(baseKey, userId));
  localStorage.removeItem(baseKey);
}

export function clearUserCache(userId: string): void {
  const baseKeys = [
    STORAGE_KEYS.GOALS,
    STORAGE_KEYS.MILESTONES,
    STORAGE_KEYS.NOTES,
    STORAGE_KEYS.TODOS,
    STORAGE_KEYS.CHECKINS,
  ];

  for (const baseKey of baseKeys) {
    localStorage.removeItem(getScopedKey(baseKey, userId));
    localStorage.removeItem(baseKey);
  }
}

// Add type for API error response
type ApiErrorResponse = {
  error: string;
};

// Updated apiRequest with better error handling
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: unknown
): Promise<T> {
  // Debug log for request
  // console.log(`[Debug] API Request to ${endpoint}:`, {
  //   method,
  //   data
  // });

  const response = await fetch(`/api/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  let responseData;
  try {
    responseData = await response.json();
  } catch (e) {
    console.error('[Debug] Failed to parse response:', e);
    throw new StorageError('Invalid response format');
  }

  if (!response.ok) {
    console.error('[Debug] API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });
    const errorData = responseData as ApiErrorResponse;
    throw new StorageError(errorData.error || 'API request failed');
  }

  return responseData as T;
}

// Updated Goal functions with API sync
export async function getGoals(): Promise<Goal[]> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      const goals = await apiRequest<Goal[]>('goals', 'GET');
      writeCacheValue(STORAGE_KEYS.GOALS, userId, JSON.stringify(goals));
      return goals.map(goal => unescapeData(goal as unknown as Record<string, unknown>) as unknown as Goal);
    }

    if (!userId) return [];

    const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
    const localGoals = JSON.parse(cachedGoals || '[]');
    return localGoals.map((goal: Record<string, unknown>) => unescapeData(goal));
  } catch (error) {
    logError(error as Error, { operation: 'getGoals' });
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
    const localGoals = JSON.parse(cachedGoals || '[]');
    return localGoals.map((goal: Record<string, unknown>) => unescapeData(goal));
  }
}

// Updated getGoal to handle async/await
export async function getGoal(id: string): Promise<Goal | null> {
  try {
    const goals = await getGoals();
    return goals.find(goal => goal.id === id) || null;
  } catch (error) {
    logError(error as Error, { operation: 'getGoal', goalId: id });
    // Fallback to local storage
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
    const localGoals = JSON.parse(cachedGoals || '[]');
    const localGoal = localGoals.find((goal: Goal) => goal.id === id);
    return localGoal ? unescapeData(localGoal as unknown as Record<string, unknown>) as unknown as Goal : null;
  }
}

export async function createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
  try {
    const sanitizedGoal = sanitizeData(goal);

    if (!sanitizedGoal.title) {
      throw new ValidationError('Goal title is required');
    }

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (isOnline()) {
      const newGoal = await apiRequest<Goal>('goals', 'POST', sanitizedGoal);
      const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
      const goals = JSON.parse(cachedGoals || '[]');
      writeCacheValue(STORAGE_KEYS.GOALS, userId, JSON.stringify([...goals, newGoal]));
      return unescapeData(newGoal as unknown as Record<string, unknown>) as unknown as Goal;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
    const goals = JSON.parse(cachedGoals || '[]');
    const newGoal = {
      ...sanitizedGoal,
      id: `temp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    writeCacheValue(STORAGE_KEYS.GOALS, userId, JSON.stringify([...goals, newGoal]));
    return unescapeData(newGoal as unknown as Record<string, unknown>) as unknown as Goal;
  } catch (error) {
    logError(error as Error, { operation: 'createGoal', data: goal });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to create goal');
  }
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  try {
    const sanitizedUpdates = sanitizeData(updates);

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (isOnline()) {
      const updatedGoal = await apiRequest<Goal>('goals', 'PUT', { id, ...sanitizedUpdates });
      const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
      const goals = JSON.parse(cachedGoals || '[]');
      const updatedGoals = goals.map((goal: Goal) => goal.id === id ? updatedGoal : goal);
      writeCacheValue(STORAGE_KEYS.GOALS, userId, JSON.stringify(updatedGoals));
      return unescapeData(updatedGoal as unknown as Record<string, unknown>) as unknown as Goal;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
    const goals = JSON.parse(cachedGoals || '[]');
    const existingGoal = goals.find((goal: Goal) => goal.id === id);
    if (!existingGoal) {
      throw new StorageError('Goal not found');
    }
    const updatedGoal = { ...existingGoal, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    const updatedGoals = goals.map((goal: Goal) => goal.id === id ? updatedGoal : goal);
    writeCacheValue(STORAGE_KEYS.GOALS, userId, JSON.stringify(updatedGoals));
    return unescapeData(updatedGoal as unknown as Record<string, unknown>) as unknown as Goal;
  } catch (error) {
    logError(error as Error, { operation: 'updateGoal', goalId: id, updates });
    throw new StorageError('Failed to update goal');
  }
}

export async function deleteGoal(id: string): Promise<boolean> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      await apiRequest<{ success: true }>(`goals?id=${id}`, 'DELETE');
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedGoals = readCacheValue(STORAGE_KEYS.GOALS, userId);
    const goals = JSON.parse(cachedGoals || '[]');
    const filtered = goals.filter((goal: Goal) => goal.id !== id);
    writeCacheValue(STORAGE_KEYS.GOALS, userId, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteGoal', goalId: id });
    throw new StorageError('Failed to delete goal');
  }
}

// Updated Milestone functions with API sync
export async function getMilestones(): Promise<Milestone[]> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      const milestones = await apiRequest<Milestone[]>('milestones', 'GET');
      writeCacheValue(STORAGE_KEYS.MILESTONES, userId, JSON.stringify(milestones));
      return milestones.map(milestone => unescapeData(milestone as unknown as Record<string, unknown>) as unknown as Milestone);
    }

    if (!userId) return [];

    const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
    const localMilestones = JSON.parse(cachedMilestones || '[]');
    return localMilestones.map((milestone: Record<string, unknown>) => unescapeData(milestone));
  } catch (error) {
    logError(error as Error, { operation: 'getMilestones' });
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
    const localMilestones = JSON.parse(cachedMilestones || '[]');
    return localMilestones.map((milestone: Record<string, unknown>) => unescapeData(milestone));
  }
}

export async function getMilestone(id: string): Promise<Milestone | null> {
  try {
    const milestones = await getMilestones();
    return milestones.find(milestone => milestone.id === id) || null;
  } catch (error) {
    logError(error as Error, { operation: 'getMilestone', milestoneId: id });
    // Fallback to local storage
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
    const localMilestones = JSON.parse(cachedMilestones || '[]');
    const localMilestone = localMilestones.find((milestone: Milestone) => milestone.id === id);
    return localMilestone ? unescapeData(localMilestone as unknown as Record<string, unknown>) as unknown as Milestone : null;
  }
}

export async function createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Milestone> {
  try {
    const sanitizedMilestone = sanitizeData(milestone);

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (!sanitizedMilestone.goalId || !sanitizedMilestone.title || !sanitizedMilestone.date) {
      throw new ValidationError('Missing required fields');
    }

    if (isOnline()) {
      const newMilestone = await apiRequest<Milestone>('milestones', 'POST', sanitizedMilestone);
      const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
      const milestones = JSON.parse(cachedMilestones || '[]');
      writeCacheValue(STORAGE_KEYS.MILESTONES, userId, JSON.stringify([...milestones, newMilestone]));
      return unescapeData(newMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
    const milestones = JSON.parse(cachedMilestones || '[]');
    const newMilestone = {
      ...sanitizedMilestone,
      id: `temp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    writeCacheValue(STORAGE_KEYS.MILESTONES, userId, JSON.stringify([...milestones, newMilestone]));
    return unescapeData(newMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
  } catch (error) {
    logError(error as Error, { operation: 'createMilestone', data: milestone });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to create milestone');
  }
}

export async function updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
  try {
    const sanitizedUpdates = sanitizeData(updates);

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (isOnline()) {
      const updatedMilestone = await apiRequest<Milestone>('milestones', 'PUT', { id, ...sanitizedUpdates });
      const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
      const milestones = JSON.parse(cachedMilestones || '[]');
      const updatedMilestones = milestones.map((milestone: Milestone) => milestone.id === id ? updatedMilestone : milestone);
      writeCacheValue(STORAGE_KEYS.MILESTONES, userId, JSON.stringify(updatedMilestones));
      return unescapeData(updatedMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
    const milestones = JSON.parse(cachedMilestones || '[]');
    const existingMilestone = milestones.find((milestone: Milestone) => milestone.id === id);
    if (!existingMilestone) {
      throw new StorageError('Milestone not found');
    }
    const updatedMilestone = { ...existingMilestone, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    const updatedMilestones = milestones.map((milestone: Milestone) => milestone.id === id ? updatedMilestone : milestone);
    writeCacheValue(STORAGE_KEYS.MILESTONES, userId, JSON.stringify(updatedMilestones));
    return unescapeData(updatedMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
  } catch (error) {
    logError(error as Error, { operation: 'updateMilestone', milestoneId: id, updates });
    throw new StorageError('Failed to update milestone');
  }
}

export async function deleteMilestone(id: string): Promise<boolean> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      await apiRequest<{ success: true }>(`milestones?id=${id}`, 'DELETE');
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedMilestones = readCacheValue(STORAGE_KEYS.MILESTONES, userId);
    const milestones = JSON.parse(cachedMilestones || '[]');
    const filtered = milestones.filter((milestone: Milestone) => milestone.id !== id);
    writeCacheValue(STORAGE_KEYS.MILESTONES, userId, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteMilestone', milestoneId: id });
    throw new StorageError('Failed to delete milestone');
  }
}

// Updated Note functions with API sync
export async function getNotes(): Promise<Note[]> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      const notes = await apiRequest<Note[]>('notes', 'GET');
      writeCacheValue(STORAGE_KEYS.NOTES, userId, JSON.stringify(notes));
      return notes.map(note => unescapeData(note as unknown as Record<string, unknown>) as unknown as Note);
    }

    if (!userId) return [];

    const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
    const localNotes = JSON.parse(cachedNotes || '[]');
    return localNotes.map((note: Record<string, unknown>) => unescapeData(note));
  } catch (error) {
    logError(error as Error, { operation: 'getNotes' });
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
    const localNotes = JSON.parse(cachedNotes || '[]');
    return localNotes.map((note: Record<string, unknown>) => unescapeData(note));
  }
}

export async function getNote(id: string): Promise<Note | null> {
  try {
    const notes = await getNotes();
    return notes.find(note => note.id === id) || null;
  } catch (error) {
    logError(error as Error, { operation: 'getNote', noteId: id });
    // Fallback to local storage
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
    const localNotes = JSON.parse(cachedNotes || '[]');
    const localNote = localNotes.find((note: Note) => note.id === id);
    return localNote ? unescapeData(localNote as unknown as Record<string, unknown>) as unknown as Note : null;
  }
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  try {
    const sanitizedNote = sanitizeData(note);

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (!sanitizedNote.title || !sanitizedNote.content) {
      throw new ValidationError('Title and content are required');
    }

    if (isOnline()) {
      const newNote = await apiRequest<Note>('notes', 'POST', {
        ...sanitizedNote,
        isPinned: sanitizedNote.isPinned ?? false
      });
      const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
      const notes = JSON.parse(cachedNotes || '[]');
      writeCacheValue(STORAGE_KEYS.NOTES, userId, JSON.stringify([...notes, newNote]));
      return unescapeData(newNote as unknown as Record<string, unknown>) as unknown as Note;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
    const notes = JSON.parse(cachedNotes || '[]');
    const newNote = {
      ...sanitizedNote,
      id: `temp_${Date.now()}`,
      isPinned: sanitizedNote.isPinned ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    writeCacheValue(STORAGE_KEYS.NOTES, userId, JSON.stringify([...notes, newNote]));
    return unescapeData(newNote as unknown as Record<string, unknown>) as unknown as Note;
  } catch (error) {
    logError(error as Error, { operation: 'createNote', data: note });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to create note');
  }
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  try {
    const sanitizedUpdates = sanitizeData(updates);

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (isOnline()) {
      const updatedNote = await apiRequest<Note>('notes', 'PUT', { id, ...sanitizedUpdates });
      const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
      const notes = JSON.parse(cachedNotes || '[]');
      const updatedNotes = notes.map((note: Note) => note.id === id ? updatedNote : note);
      writeCacheValue(STORAGE_KEYS.NOTES, userId, JSON.stringify(updatedNotes));
      return unescapeData(updatedNote as unknown as Record<string, unknown>) as unknown as Note;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
    const notes = JSON.parse(cachedNotes || '[]');
    const existingNote = notes.find((note: Note) => note.id === id);
    if (!existingNote) {
      throw new StorageError('Note not found');
    }
    const updatedNote = { ...existingNote, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    const updatedNotes = notes.map((note: Note) => note.id === id ? updatedNote : note);
    writeCacheValue(STORAGE_KEYS.NOTES, userId, JSON.stringify(updatedNotes));
    return unescapeData(updatedNote as unknown as Record<string, unknown>) as unknown as Note;
  } catch (error) {
    logError(error as Error, { operation: 'updateNote', noteId: id, updates });
    throw new StorageError('Failed to update note');
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      await apiRequest<{ success: true }>(`notes?id=${id}`, 'DELETE');
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedNotes = readCacheValue(STORAGE_KEYS.NOTES, userId);
    const notes = JSON.parse(cachedNotes || '[]');
    const filtered = notes.filter((note: Note) => note.id !== id);
    writeCacheValue(STORAGE_KEYS.NOTES, userId, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteNote', noteId: id });
    throw new StorageError('Failed to delete note');
  }
}

// Updated Todo functions with API sync
export async function getTodos(): Promise<Todo[]> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      const todos = await apiRequest<Todo[]>('todos', 'GET');
      writeCacheValue(STORAGE_KEYS.TODOS, userId, JSON.stringify(todos));
      return todos.map(todo => unescapeData(todo as unknown as Record<string, unknown>) as unknown as Todo);
    }

    if (!userId) return [];

    const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
    const localTodos = JSON.parse(cachedTodos || '[]');
    return localTodos.map((todo: Record<string, unknown>) => unescapeData(todo));
  } catch (error) {
    logError(error as Error, { operation: 'getTodos' });
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
    const localTodos = JSON.parse(cachedTodos || '[]');
    return localTodos.map((todo: Record<string, unknown>) => unescapeData(todo));
  }
}

export async function getTodo(id: string): Promise<Todo | null> {
  try {
    const todos = await getTodos();
    return todos.find(todo => todo.id === id) || null;
  } catch (error) {
    logError(error as Error, { operation: 'getTodo', todoId: id });
    // Fallback to local storage
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
    const localTodos = JSON.parse(cachedTodos || '[]');
    const localTodo = localTodos.find((todo: Todo) => todo.id === id);
    return localTodo ? unescapeData(localTodo as unknown as Record<string, unknown>) as unknown as Todo : null;
  }
}

export async function createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Todo> {
  try {
    const sanitizedTodo = sanitizeData(todo);

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (!sanitizedTodo.title || !sanitizedTodo.priority) {
      throw new ValidationError('Title and priority are required');
    }

    if (!['low', 'medium', 'high'].includes(sanitizedTodo.priority)) {
      throw new ValidationError('Invalid priority level');
    }

    if (isOnline()) {
      const newTodo = await apiRequest<Todo>('todos', 'POST', {
        ...sanitizedTodo,
        completed: false
      });
      const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
      const todos = JSON.parse(cachedTodos || '[]');
      writeCacheValue(STORAGE_KEYS.TODOS, userId, JSON.stringify([...todos, newTodo]));
      return unescapeData(newTodo as unknown as Record<string, unknown>) as unknown as Todo;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
    const todos = JSON.parse(cachedTodos || '[]');
    const newTodo = {
      ...sanitizedTodo,
      id: `temp_${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    writeCacheValue(STORAGE_KEYS.TODOS, userId, JSON.stringify([...todos, newTodo]));
    return unescapeData(newTodo as unknown as Record<string, unknown>) as unknown as Todo;
  } catch (error) {
    logError(error as Error, { operation: 'createTodo', data: todo });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to create todo');
  }
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  try {
    const sanitizedUpdates = sanitizeData(updates);

    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (sanitizedUpdates.priority && !['low', 'medium', 'high'].includes(sanitizedUpdates.priority)) {
      throw new ValidationError('Invalid priority level');
    }

    if (isOnline()) {
      const updatedTodo = await apiRequest<Todo>('todos', 'PUT', { id, ...sanitizedUpdates });
      const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
      const todos = JSON.parse(cachedTodos || '[]');
      const updatedTodos = todos.map((todo: Todo) => todo.id === id ? updatedTodo : todo);
      writeCacheValue(STORAGE_KEYS.TODOS, userId, JSON.stringify(updatedTodos));
      return unescapeData(updatedTodo as unknown as Record<string, unknown>) as unknown as Todo;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
    const todos = JSON.parse(cachedTodos || '[]');
    const existingTodo = todos.find((todo: Todo) => todo.id === id);
    if (!existingTodo) {
      throw new StorageError('Todo not found');
    }
    const updatedTodo = { ...existingTodo, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    const updatedTodos = todos.map((todo: Todo) => todo.id === id ? updatedTodo : todo);
    writeCacheValue(STORAGE_KEYS.TODOS, userId, JSON.stringify(updatedTodos));
    return unescapeData(updatedTodo as unknown as Record<string, unknown>) as unknown as Todo;
  } catch (error) {
    logError(error as Error, { operation: 'updateTodo', todoId: id, updates });
    throw new StorageError('Failed to update todo');
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      await apiRequest<{ success: true }>(`todos?id=${id}`, 'DELETE');
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedTodos = readCacheValue(STORAGE_KEYS.TODOS, userId);
    const todos = JSON.parse(cachedTodos || '[]');
    const filtered = todos.filter((todo: Todo) => todo.id !== id);
    writeCacheValue(STORAGE_KEYS.TODOS, userId, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteTodo', todoId: id });
    throw new StorageError('Failed to delete todo');
  }
}

export async function toggleTodoComplete(id: string): Promise<Todo> {
  try {
    const todo = await getTodo(id);
    if (!todo) {
      throw new ValidationError('Todo not found');
    }
    return updateTodo(id, { completed: !todo.completed });
  } catch (error) {
    logError(error as Error, { operation: 'toggleTodoComplete', todoId: id });
    throw new StorageError('Failed to toggle todo completion');
  }
}

// Updated CheckIn functions with API sync
export async function getCheckIns(): Promise<CheckIn[]> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      const checkIns = await apiRequest<CheckIn[]>('checkins', 'GET');
      writeCacheValue(STORAGE_KEYS.CHECKINS, userId, JSON.stringify(checkIns));
      return checkIns.map(checkIn => unescapeData(checkIn as unknown as Record<string, unknown>) as unknown as CheckIn);
    }

    if (!userId) return [];

    const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
    const localCheckIns = JSON.parse(cachedCheckIns || '[]');
    return localCheckIns.map((checkIn: Record<string, unknown>) => unescapeData(checkIn));
  } catch (error) {
    logError(error as Error, { operation: 'getCheckIns' });
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
    const localCheckIns = JSON.parse(cachedCheckIns || '[]');
    return localCheckIns.map((checkIn: Record<string, unknown>) => unescapeData(checkIn));
  }
}

export async function getCheckIn(id: string): Promise<CheckIn | null> {
  try {
    const checkIns = await getCheckIns();
    return checkIns.find(checkIn => checkIn.id === id) || null;
  } catch (error) {
    logError(error as Error, { operation: 'getCheckIn', checkInId: id });
    // Fallback to local storage
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
    const localCheckIns = JSON.parse(cachedCheckIns || '[]');
    const localCheckIn = localCheckIns.find((checkIn: CheckIn) => checkIn.id === id);
    return localCheckIn ? unescapeData(localCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn : null;
  }
}

export async function getCheckInByDate(date: string): Promise<CheckIn | null> {
  try {
    const checkIns = await getCheckIns();
    return checkIns.find(checkIn => checkIn.date === date) || null;
  } catch (error) {
    logError(error as Error, { operation: 'getCheckInByDate', date });
    // Fallback to local storage
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
    const localCheckIns = JSON.parse(cachedCheckIns || '[]');
    const localCheckIn = localCheckIns.find((checkIn: CheckIn) => checkIn.date === date);
    return localCheckIn ? unescapeData(localCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn : null;
  }
}

export async function createCheckIn(checkIn: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>): Promise<CheckIn> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const processedData = {
      ...checkIn,
      accomplishments: ensureJsonString(checkIn.accomplishments),
      challenges: ensureJsonString(checkIn.challenges),
      goals: ensureJsonString(checkIn.goals),
    };

    const sanitizedCheckIn = sanitizeData(processedData);

    const requiredFields = ['date', 'mood', 'energy', 'accomplishments', 'challenges', 'goals'] as const;
    const missingFields = requiredFields.filter(field => !sanitizedCheckIn[field]);

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const validMoods = ['great', 'good', 'okay', 'bad', 'terrible'] as const;
    const validEnergies = ['high', 'medium', 'low'] as const;

    if (
      typeof sanitizedCheckIn.mood !== 'string' ||
      !validMoods.includes(sanitizedCheckIn.mood as (typeof validMoods)[number])
    ) {
      throw new ValidationError(`Invalid mood value. Must be one of: ${validMoods.join(', ')}`);
    }

    if (
      typeof sanitizedCheckIn.energy !== 'string' ||
      !validEnergies.includes(sanitizedCheckIn.energy as (typeof validEnergies)[number])
    ) {
      throw new ValidationError(`Invalid energy value. Must be one of: ${validEnergies.join(', ')}`);
    }

    if (isOnline()) {
      const newCheckIn = await apiRequest<CheckIn>('checkins', 'POST', sanitizedCheckIn);
      const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
      const checkIns = JSON.parse(cachedCheckIns || '[]');
      writeCacheValue(STORAGE_KEYS.CHECKINS, userId, JSON.stringify([...checkIns, newCheckIn]));
      return unescapeData(newCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
    const checkIns = JSON.parse(cachedCheckIns || '[]');
    const newCheckIn = {
      ...sanitizedCheckIn,
      id: `temp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    writeCacheValue(STORAGE_KEYS.CHECKINS, userId, JSON.stringify([...checkIns, newCheckIn]));
    return unescapeData(newCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
  } catch (error) {
    logError(error as Error, { operation: 'createCheckIn', data: checkIn });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to create check-in');
  }
}

export async function updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<CheckIn> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const processedUpdates = {
      ...updates,
      ...(updates.accomplishments !== undefined && { accomplishments: ensureJsonString(updates.accomplishments) }),
      ...(updates.challenges !== undefined && { challenges: ensureJsonString(updates.challenges) }),
      ...(updates.goals !== undefined && { goals: ensureJsonString(updates.goals) }),
    };

    const sanitizedUpdates = sanitizeData(processedUpdates);

    if (isOnline()) {
      const updatedCheckIn = await apiRequest<CheckIn>('checkins', 'PUT', { id, ...sanitizedUpdates });
      const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
      const checkIns = JSON.parse(cachedCheckIns || '[]');
      const updatedCheckIns = checkIns.map((checkIn: CheckIn) => checkIn.id === id ? updatedCheckIn : checkIn);
      writeCacheValue(STORAGE_KEYS.CHECKINS, userId, JSON.stringify(updatedCheckIns));
      return unescapeData(updatedCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
    const checkIns = JSON.parse(cachedCheckIns || '[]');
    const existingCheckIn = checkIns.find((checkIn: CheckIn) => checkIn.id === id);
    if (!existingCheckIn) {
      throw new StorageError('Check-in not found');
    }
    const updatedCheckIn = { ...existingCheckIn, ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    const updatedCheckIns = checkIns.map((checkIn: CheckIn) => checkIn.id === id ? updatedCheckIn : checkIn);
    writeCacheValue(STORAGE_KEYS.CHECKINS, userId, JSON.stringify(updatedCheckIns));
    return unescapeData(updatedCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
  } catch (error) {
    logError(error as Error, { operation: 'updateCheckIn', checkInId: id, updates });
    throw new StorageError('Failed to update check-in');
  }
}

export async function deleteCheckIn(id: string): Promise<boolean> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      await apiRequest<{ success: true }>(`checkins?id=${id}`, 'DELETE');
    }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

    const cachedCheckIns = readCacheValue(STORAGE_KEYS.CHECKINS, userId);
    const checkIns = JSON.parse(cachedCheckIns || '[]');
    const filtered = checkIns.filter((checkIn: CheckIn) => checkIn.id !== id);
    writeCacheValue(STORAGE_KEYS.CHECKINS, userId, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteCheckIn', checkInId: id });
    throw new StorageError('Failed to delete check-in');
  }
}
