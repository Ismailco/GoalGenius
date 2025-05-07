import { Goal, Milestone, Note, Todo, CheckIn } from '@/app/types';
// import { v4 as uuidv4 } from 'uuid';
import { sanitizeForStorage } from '@/lib/validation';
import validator from 'validator';
import { StorageError, ValidationError, logError } from './error';

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
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    throw new StorageError('No user ID found');
  }

  // Debug log for request
  console.log(`[Debug] API Request to ${endpoint}:`, {
    method,
    userId,
    data
  });

  const response = await fetch(`/api/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify({ ...data, userId }) : undefined,
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
    if (!userId) return [];

    // Fetch from API
    const goals = await apiRequest<Goal[]>(`goals?userId=${userId}`, 'GET');

    // Update local storage
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

    return goals.map(goal => unescapeData(goal as unknown as Record<string, unknown>) as unknown as Goal);
  } catch (error) {
    // Fallback to local storage if API fails
    logError(error as Error, { operation: 'getGoals' });
    const localGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
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
    const localGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
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

    // Create via API
    const newGoal = await apiRequest<Goal>('goals', 'POST', sanitizedGoal);

    // Update local storage
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([...goals, newGoal]));

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

    // Update via API
    const updatedGoal = await apiRequest<Goal>('goals', 'PUT', { id, ...sanitizedUpdates });

    // Update local storage
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const updatedGoals = goals.map((goal: Goal) =>
      goal.id === id ? updatedGoal : goal
    );
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));

    return unescapeData(updatedGoal as unknown as Record<string, unknown>) as unknown as Goal;
  } catch (error) {
    logError(error as Error, { operation: 'updateGoal', goalId: id, updates });
    throw new StorageError('Failed to update goal');
  }
}

export async function deleteGoal(id: string): Promise<boolean> {
  try {
    // Delete via API
    await apiRequest<{ success: true }>(`goals?id=${id}`, 'DELETE');

    // Update local storage
    const goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    const filtered = goals.filter((goal: Goal) => goal.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));

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
    if (!userId) return [];

    // Fetch from API
    const milestones = await apiRequest<Milestone[]>(`milestones?userId=${userId}`, 'GET');

    // Update local storage
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));

    return milestones.map(milestone =>
      unescapeData(milestone as unknown as Record<string, unknown>) as unknown as Milestone
    );
  } catch (error) {
    // Fallback to local storage
    logError(error as Error, { operation: 'getMilestones' });
    const stored = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    const localMilestones = stored ? JSON.parse(stored) : [];
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
    const localMilestones = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILESTONES) || '[]');
    const localMilestone = localMilestones.find((milestone: Milestone) => milestone.id === id);
    return localMilestone ? unescapeData(localMilestone as unknown as Record<string, unknown>) as unknown as Milestone : null;
  }
}

export async function createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Milestone> {
  try {
    const sanitizedMilestone = sanitizeData(milestone);

    // Validate required fields
    if (!sanitizedMilestone.goalId || !sanitizedMilestone.title || !sanitizedMilestone.date) {
      throw new ValidationError('Missing required fields');
    }

    // Create via API
    const newMilestone = await apiRequest<Milestone>('milestones', 'POST', sanitizedMilestone);

    // Update local storage
    const milestones = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILESTONES) || '[]');
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify([...milestones, newMilestone]));

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

    // Update via API
    const updatedMilestone = await apiRequest<Milestone>('milestones', 'PUT', { id, ...sanitizedUpdates });

    // Update local storage
    const milestones = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILESTONES) || '[]');
    const updatedMilestones = milestones.map((milestone: Milestone) =>
      milestone.id === id ? updatedMilestone : milestone
    );
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones));

    return unescapeData(updatedMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
  } catch (error) {
    logError(error as Error, { operation: 'updateMilestone', milestoneId: id, updates });
    throw new StorageError('Failed to update milestone');
  }
}

export async function deleteMilestone(id: string): Promise<boolean> {
  try {
    // Delete via API
    await apiRequest<{ success: true }>(`milestones?id=${id}`, 'DELETE');

    // Update local storage
    const milestones = JSON.parse(localStorage.getItem(STORAGE_KEYS.MILESTONES) || '[]');
    const filtered = milestones.filter((milestone: Milestone) => milestone.id !== id);
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(filtered));

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
    if (!userId) return [];

    // Fetch from API
    const notes = await apiRequest<Note[]>(`notes?userId=${userId}`, 'GET');

    // Update local storage
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));

    return notes.map(note =>
      unescapeData(note as unknown as Record<string, unknown>) as unknown as Note
    );
  } catch (error) {
    // Fallback to local storage
    logError(error as Error, { operation: 'getNotes' });
    const localNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
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
    const localNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const localNote = localNotes.find((note: Note) => note.id === id);
    return localNote ? unescapeData(localNote as unknown as Record<string, unknown>) as unknown as Note : null;
  }
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  try {
    const sanitizedNote = sanitizeData(note);

    // Validate required fields
    if (!sanitizedNote.title || !sanitizedNote.content) {
      throw new ValidationError('Title and content are required');
    }

    // Create via API
    const newNote = await apiRequest<Note>('notes', 'POST', {
      ...sanitizedNote,
      isPinned: sanitizedNote.isPinned ?? false
    });

    // Update local storage
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([...notes, newNote]));

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

    // Update via API
    const updatedNote = await apiRequest<Note>('notes', 'PUT', { id, ...sanitizedUpdates });

    // Update local storage
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const updatedNotes = notes.map((note: Note) =>
      note.id === id ? updatedNote : note
    );
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));

    return unescapeData(updatedNote as unknown as Record<string, unknown>) as unknown as Note;
  } catch (error) {
    logError(error as Error, { operation: 'updateNote', noteId: id, updates });
    throw new StorageError('Failed to update note');
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    // Delete via API
    await apiRequest<{ success: true }>(`notes?id=${id}`, 'DELETE');

    // Update local storage
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
    const filtered = notes.filter((note: Note) => note.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));

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
    if (!userId) return [];

    // Fetch from API
    const todos = await apiRequest<Todo[]>(`todos?userId=${userId}`, 'GET');

    // Update local storage
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));

    return todos.map(todo =>
      unescapeData(todo as unknown as Record<string, unknown>) as unknown as Todo
    );
  } catch (error) {
    // Fallback to local storage
    logError(error as Error, { operation: 'getTodos' });
    const localTodos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
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
    const localTodos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    const localTodo = localTodos.find((todo: Todo) => todo.id === id);
    return localTodo ? unescapeData(localTodo as unknown as Record<string, unknown>) as unknown as Todo : null;
  }
}

export async function createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Todo> {
  try {
    const sanitizedTodo = sanitizeData(todo);

    // Validate required fields
    if (!sanitizedTodo.title || !sanitizedTodo.priority) {
      throw new ValidationError('Title and priority are required');
    }

    // Validate priority
    if (!['low', 'medium', 'high'].includes(sanitizedTodo.priority)) {
      throw new ValidationError('Invalid priority level');
    }

    // Create via API
    const newTodo = await apiRequest<Todo>('todos', 'POST', {
      ...sanitizedTodo,
      completed: false
    });

    // Update local storage
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify([...todos, newTodo]));

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

    // Validate priority if it's being updated
    if (sanitizedUpdates.priority && !['low', 'medium', 'high'].includes(sanitizedUpdates.priority)) {
      throw new ValidationError('Invalid priority level');
    }

    // Update via API
    const updatedTodo = await apiRequest<Todo>('todos', 'PUT', { id, ...sanitizedUpdates });

    // Update local storage
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    const updatedTodos = todos.map((todo: Todo) =>
      todo.id === id ? updatedTodo : todo
    );
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(updatedTodos));

    return unescapeData(updatedTodo as unknown as Record<string, unknown>) as unknown as Todo;
  } catch (error) {
    logError(error as Error, { operation: 'updateTodo', todoId: id, updates });
    throw new StorageError('Failed to update todo');
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    // Delete via API
    await apiRequest<{ success: true }>(`todos?id=${id}`, 'DELETE');

    // Update local storage
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    const filtered = todos.filter((todo: Todo) => todo.id !== id);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(filtered));

    return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteTodo', todoId: id });
    throw new StorageError('Failed to delete todo');
  }
}

// Helper function for toggling todo completion status
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
    if (!userId) return [];

    // Fetch from API
    const checkIns = await apiRequest<CheckIn[]>(`checkins?userId=${userId}`, 'GET');

    // Update local storage
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));

    return checkIns.map(checkIn =>
      unescapeData(checkIn as unknown as Record<string, unknown>) as unknown as CheckIn
    );
  } catch (error) {
    // Fallback to local storage
    logError(error as Error, { operation: 'getCheckIns' });
    const localCheckIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
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
    const localCheckIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
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
    const localCheckIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
    const localCheckIn = localCheckIns.find((checkIn: CheckIn) => checkIn.date === date);
    return localCheckIn ? unescapeData(localCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn : null;
  }
}

export async function createCheckIn(checkIn: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>): Promise<CheckIn> {
  try {
    console.log('[Debug] Creating check-in with data:', checkIn);

    // Process the data before sanitization
    const processedData = {
      ...checkIn,
      accomplishments: ensureJsonString(checkIn.accomplishments),
      challenges: ensureJsonString(checkIn.challenges),
      goals: ensureJsonString(checkIn.goals),
    };

    const sanitizedCheckIn = sanitizeData(processedData);

    // Validate required fields
    const requiredFields = ['date', 'mood', 'energy', 'accomplishments', 'challenges', 'goals'] as const;
    const missingFields = requiredFields.filter(field => !sanitizedCheckIn[field]);

    if (missingFields.length > 0) {
      console.error('[Debug] Missing required fields:', missingFields);
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate mood and energy values
    const validMoods = ['great', 'good', 'okay', 'bad', 'terrible'] as const;
    const validEnergies = ['high', 'medium', 'low'] as const;

    if (!validMoods.includes(sanitizedCheckIn.mood as any)) {
      console.error('[Debug] Invalid mood value:', sanitizedCheckIn.mood);
      throw new ValidationError(`Invalid mood value. Must be one of: ${validMoods.join(', ')}`);
    }

    if (!validEnergies.includes(sanitizedCheckIn.energy as any)) {
      console.error('[Debug] Invalid energy value:', sanitizedCheckIn.energy);
      throw new ValidationError(`Invalid energy value. Must be one of: ${validEnergies.join(', ')}`);
    }

    // Create via API
    const newCheckIn = await apiRequest<CheckIn>('checkins', 'POST', sanitizedCheckIn);

    // Update local storage
    const checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify([...checkIns, newCheckIn]));

    return unescapeData(newCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
  } catch (error) {
    console.error('[Debug] Check-in creation error:', error);
    logError(error as Error, { operation: 'createCheckIn', data: checkIn });
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new StorageError('Failed to create check-in');
  }
}

export async function updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<CheckIn> {
  try {
    // Process array fields if they exist in the updates
    const processedUpdates = {
      ...updates,
      ...(updates.accomplishments !== undefined && { accomplishments: ensureJsonString(updates.accomplishments) }),
      ...(updates.challenges !== undefined && { challenges: ensureJsonString(updates.challenges) }),
      ...(updates.goals !== undefined && { goals: ensureJsonString(updates.goals) }),
    };

    const sanitizedUpdates = sanitizeData(processedUpdates);

    // Update via API
    const updatedCheckIn = await apiRequest<CheckIn>('checkins', 'PUT', { id, ...sanitizedUpdates });

    // Update local storage
    const checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
    const updatedCheckIns = checkIns.map((checkIn: CheckIn) =>
      checkIn.id === id ? updatedCheckIn : checkIn
    );
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(updatedCheckIns));

    return unescapeData(updatedCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
  } catch (error) {
    logError(error as Error, { operation: 'updateCheckIn', checkInId: id, updates });
    throw new StorageError('Failed to update check-in');
  }
}

export async function deleteCheckIn(id: string): Promise<boolean> {
  try {
    // Delete via API
    await apiRequest<{ success: true }>(`checkins?id=${id}`, 'DELETE');

    // Update local storage
    const checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
    const filtered = checkIns.filter((checkIn: CheckIn) => checkIn.id !== id);
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(filtered));

    return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteCheckIn', checkInId: id });
    throw new StorageError('Failed to delete check-in');
  }
}
