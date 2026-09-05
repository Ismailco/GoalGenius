import { Goal, Milestone, Note, Todo, TodoOccurrence, CheckIn } from '@/app/types';
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

function normalizeCheckInArray(value: string[] | string | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed: unknown = JSON.parse(validator.unescape(value));
    return Array.isArray(parsed) && parsed.every((item): item is string => typeof item === 'string')
      ? parsed
      : [];
  } catch {
    return [];
  }
}

const STORAGE_KEYS = {
  GOALS: 'goals',
  MILESTONES: 'milestones',
  NOTES: 'notes',
  TODOS: 'todos',
  CHECKINS: 'checkins',
  USER_ID: 'userId',
  SYNC_QUEUE: 'syncQueue',
};

type ResourceName = 'goals' | 'milestones' | 'notes' | 'todos' | 'checkins';
type MutationMethod = 'POST' | 'PUT' | 'DELETE';
type CachedRecord = Record<string, unknown> & { id: string };

interface PendingMutation {
  id: string;
  userId: string;
  resource: ResourceName;
  method: MutationMethod;
  entityId: string;
  body?: Record<string, unknown>;
  createdAt: string;
}

interface SyncResult {
  synced: number;
  failed: number;
  pending: number;
}

const RESOURCE_STORAGE_KEYS: Record<ResourceName, string> = {
  goals: STORAGE_KEYS.GOALS,
  milestones: STORAGE_KEYS.MILESTONES,
  notes: STORAGE_KEYS.NOTES,
  todos: STORAGE_KEYS.TODOS,
  checkins: STORAGE_KEYS.CHECKINS,
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

export function clearUserCache(userId: string): void {
  const baseKeys = [
    STORAGE_KEYS.GOALS,
    STORAGE_KEYS.MILESTONES,
    STORAGE_KEYS.NOTES,
    STORAGE_KEYS.TODOS,
    STORAGE_KEYS.CHECKINS,
    STORAGE_KEYS.SYNC_QUEUE,
  ];

  for (const baseKey of baseKeys) {
    localStorage.removeItem(getScopedKey(baseKey, userId));
    localStorage.removeItem(baseKey);
  }
}

export async function clearOfflineCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  const cacheKeys = await caches.keys();
  await Promise.all(
    cacheKeys
      .filter((cacheKey) => cacheKey.startsWith('goalgenius-'))
      .map((cacheKey) => caches.delete(cacheKey)),
  );
  localStorage.removeItem('pwaCacheReady');
  localStorage.removeItem('pwaCacheVersion');
}

function createClientId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function readCachedList<T extends { id: string }>(
  baseKey: string,
  userId: string | null,
): T[] {
  const cachedValue = readCacheValue(baseKey, userId);
  return JSON.parse(cachedValue || '[]') as T[];
}

function writeCachedList<T extends { id: string }>(
  baseKey: string,
  userId: string | null,
  records: T[],
): void {
  writeCacheValue(baseKey, userId, JSON.stringify(records));
}

function addCachedRecord<T extends { id: string }>(
  baseKey: string,
  userId: string | null,
  record: T,
): void {
  const records = readCachedList<T>(baseKey, userId);
  writeCachedList(baseKey, userId, [...records, record]);
}

function updateCachedRecord<T extends { id: string }>(
  baseKey: string,
  userId: string | null,
  id: string,
  record: T,
): void {
  const records = readCachedList<T>(baseKey, userId);
  writeCachedList(
    baseKey,
    userId,
    records.map((currentRecord) => currentRecord.id === id ? record : currentRecord),
  );
}

function deleteCachedRecord<T extends { id: string }>(
  baseKey: string,
  userId: string | null,
  id: string,
): void {
  const records = readCachedList<T>(baseKey, userId);
  writeCachedList(
    baseKey,
    userId,
    records.filter((record) => record.id !== id),
  );
}

function deleteCachedGoalCascade(userId: string | null, goalId: string): void {
  deleteCachedRecord(STORAGE_KEYS.GOALS, userId, goalId);

  const milestones = readCachedList<Milestone>(STORAGE_KEYS.MILESTONES, userId);
  writeCachedList(
    STORAGE_KEYS.MILESTONES,
    userId,
  milestones.filter((milestone) => milestone.goalId !== goalId),
  );

  const todos = readCachedList<Todo>(STORAGE_KEYS.TODOS, userId);
  writeCachedList(STORAGE_KEYS.TODOS, userId, todos.filter((todo) => todo.goalId !== goalId));

  const checkIns = readCachedList<CheckIn>(STORAGE_KEYS.CHECKINS, userId);
  writeCachedList(STORAGE_KEYS.CHECKINS, userId, checkIns.filter((checkIn) => checkIn.goalId !== goalId));
}

function deleteCachedMilestone(userId: string | null, milestoneId: string): void {
  deleteCachedRecord(STORAGE_KEYS.MILESTONES, userId, milestoneId);
  const todos = readCachedList<Todo>(STORAGE_KEYS.TODOS, userId);
  writeCachedList(STORAGE_KEYS.TODOS, userId, todos.map((todo) => (
    todo.milestoneId === milestoneId ? { ...todo, milestoneId: null } : todo
  )));
}

function readSyncQueue(userId: string | null): PendingMutation[] {
  if (!userId) return [];

  try {
    const queueValue = readCacheValue(STORAGE_KEYS.SYNC_QUEUE, userId);
    const parsedQueue = JSON.parse(queueValue || '[]');
    return Array.isArray(parsedQueue) ? parsedQueue : [];
  } catch {
    return [];
  }
}

function writeSyncQueue(userId: string | null, queue: PendingMutation[]): void {
  if (!userId) return;
  writeCacheValue(STORAGE_KEYS.SYNC_QUEUE, userId, JSON.stringify(queue));
}

function enqueueMutation(
  userId: string | null,
  mutation: Omit<PendingMutation, 'id' | 'userId' | 'createdAt'>,
): void {
  if (!userId) return;

  const queue = readSyncQueue(userId);
  writeSyncQueue(userId, [
    ...queue,
    {
      ...mutation,
      id: createClientId('mutation'),
      userId,
      createdAt: new Date().toISOString(),
    },
  ]);
}

function resolveTempId(id: string, idMap: Record<string, string>): string {
  return idMap[id] ?? id;
}

function resolveMutationBody(
  body: Record<string, unknown> | undefined,
  idMap: Record<string, string>,
): Record<string, unknown> | undefined {
  if (!body) return undefined;

  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      typeof value === 'string' ? resolveTempId(value, idMap) : value,
    ]),
  );
}

function replaceTempReferences(userId: string | null, oldId: string, newId: string): void {
  if (!userId) return;

  for (const baseKey of Object.values(RESOURCE_STORAGE_KEYS)) {
    const records = readCachedList<CachedRecord>(baseKey, userId);
    const nextRecords = records.map((record) => {
      const nextRecord = { ...record };

      if (nextRecord.id === oldId) {
        nextRecord.id = newId;
      }

      if (nextRecord.goalId === oldId) {
        nextRecord.goalId = newId;
      }

      return nextRecord;
    });

    writeCachedList(baseKey, userId, nextRecords);
  }
}

async function refreshRemoteCache(userId: string | null): Promise<void> {
  if (!userId) return;

  const [goals, milestones, notes, todos, checkIns] = await Promise.all([
    apiRequest<Goal[]>('goals', 'GET'),
    apiRequest<Milestone[]>('milestones', 'GET'),
    apiRequest<Note[]>('notes', 'GET'),
    apiRequest<Todo[]>('todos', 'GET'),
    apiRequest<CheckIn[]>('checkins', 'GET'),
  ]);

  writeCacheValue(STORAGE_KEYS.GOALS, userId, JSON.stringify(goals));
  writeCacheValue(STORAGE_KEYS.MILESTONES, userId, JSON.stringify(milestones));
  writeCacheValue(STORAGE_KEYS.NOTES, userId, JSON.stringify(notes));
  writeCacheValue(STORAGE_KEYS.TODOS, userId, JSON.stringify(todos));
  writeCacheValue(STORAGE_KEYS.CHECKINS, userId, JSON.stringify(checkIns));
}

export async function syncWorkspaceData(): Promise<SyncResult> {
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const queue = readSyncQueue(userId);

  if (!userId || !isOnline()) {
    return { synced: 0, failed: 0, pending: queue.length };
  }

  const result = await syncPendingChanges();

  if (result.pending === 0) {
    await refreshRemoteCache(userId);
  }

  return result;
}

// Add type for API error response
type ApiErrorResponse = {
  error: string;
};

export interface WorkspaceExport {
  format: 'goalgenius-export';
  version: 1;
  exportedAt: string;
  data: {
    profile: { name: string; email: string } | null;
    goals: Goal[];
    milestones: Milestone[];
    tasks: Todo[];
    taskOccurrences: TodoOccurrence[];
    notes: Note[];
    checkIns: CheckIn[];
  };
}

class ApiRequestError extends StorageError {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function shouldQueueOfflineMutation(error: unknown): boolean {
  if (!isOnline()) return true;
  if (error instanceof TypeError) return true;
  return error instanceof ApiRequestError && error.statusCode >= 500;
}

// Updated apiRequest with better error handling
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: unknown
): Promise<T> {
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
  } catch {
    throw new StorageError('Invalid response format');
  }

  if (!response.ok) {
    const errorData = responseData as ApiErrorResponse;
    throw new ApiRequestError(errorData.error || 'API request failed', response.status);
  }

  return responseData as T;
}

let syncInProgress = false;

export async function syncPendingChanges(): Promise<SyncResult> {
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const queue = readSyncQueue(userId);

  if (!userId || queue.length === 0) {
    return { synced: 0, failed: 0, pending: 0 };
  }

  if (!isOnline()) {
    return { synced: 0, failed: 0, pending: queue.length };
  }

  if (syncInProgress) {
    return { synced: 0, failed: 0, pending: queue.length };
  }

  syncInProgress = true;

  const idMap: Record<string, string> = {};
  let synced = 0;
  let remainingQueue: PendingMutation[] = [];

  try {
    for (let index = 0; index < queue.length; index += 1) {
      const mutation = queue[index];
      const endpoint = mutation.resource;
      const storageKey = RESOURCE_STORAGE_KEYS[mutation.resource];
      const entityId = resolveTempId(mutation.entityId, idMap);
      const body = resolveMutationBody(mutation.body, idMap);

      try {
        if (mutation.method === 'POST') {
          const createdRecord = await apiRequest<CachedRecord>(endpoint, 'POST', body);
          idMap[mutation.entityId] = createdRecord.id;
          updateCachedRecord(storageKey, userId, mutation.entityId, createdRecord);
          replaceTempReferences(userId, mutation.entityId, createdRecord.id);
        } else if (mutation.method === 'PUT') {
          const updatedRecord = await apiRequest<CachedRecord>(endpoint, 'PUT', {
            ...body,
            id: entityId,
          });
          updateCachedRecord(storageKey, userId, mutation.entityId, updatedRecord);
          if (entityId !== mutation.entityId) {
            updateCachedRecord(storageKey, userId, entityId, updatedRecord);
          }
        } else {
          await apiRequest<{ success: true }>(
            `${endpoint}?id=${encodeURIComponent(entityId)}`,
            'DELETE',
          );
          if (mutation.resource === 'goals') {
            deleteCachedGoalCascade(userId, mutation.entityId);
            if (entityId !== mutation.entityId) {
              deleteCachedGoalCascade(userId, entityId);
            }
          } else {
            deleteCachedRecord(storageKey, userId, mutation.entityId);
            if (entityId !== mutation.entityId) {
              deleteCachedRecord(storageKey, userId, entityId);
            }
          }
        }

        synced += 1;
      } catch (error) {
        if (
          error instanceof ApiRequestError &&
          error.statusCode === 404 &&
          mutation.method !== 'POST'
        ) {
          if (mutation.resource === 'goals') {
            deleteCachedGoalCascade(userId, mutation.entityId);
          } else {
            deleteCachedRecord(storageKey, userId, mutation.entityId);
          }
          synced += 1;
          continue;
        }

    logError(error as Error, {
      operation: 'syncPendingChanges',
      resource: mutation.resource,
      method: mutation.method,
      entityId: mutation.entityId,
    });
        remainingQueue = queue.slice(index);
        break;
      }
    }

    writeSyncQueue(userId, remainingQueue);

    if (synced > 0 && remainingQueue.length === 0) {
      await refreshRemoteCache(userId);
    }

    return {
      synced,
      failed: remainingQueue.length > 0 ? 1 : 0,
      pending: remainingQueue.length,
    };
  } finally {
    syncInProgress = false;
  }
}

// Updated Goal functions with API sync
export async function getGoals(): Promise<Goal[]> {
  try {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (isOnline()) {
      await syncPendingChanges();
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
        try {
        await syncPendingChanges();
        const newGoal = await apiRequest<Goal>('goals', 'POST', sanitizedGoal);
        addCachedRecord(STORAGE_KEYS.GOALS, userId, newGoal);
        return unescapeData(newGoal as unknown as Record<string, unknown>) as unknown as Goal;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'createGoalOnlineFallback' });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      const newGoal = {
        ...sanitizedGoal,
        id: createClientId('temp_goal'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addCachedRecord(STORAGE_KEYS.GOALS, userId, newGoal);
      enqueueMutation(userId, {
        resource: 'goals',
        method: 'POST',
        entityId: newGoal.id,
        body: sanitizedGoal,
      });
      return unescapeData(newGoal as unknown as Record<string, unknown>) as unknown as Goal;
  } catch (error) {
    logError(error as Error, { operation: 'createGoal' });
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
        try {
        await syncPendingChanges();
        const updatedGoal = await apiRequest<Goal>('goals', 'PUT', { id, ...sanitizedUpdates });
        updateCachedRecord(STORAGE_KEYS.GOALS, userId, id, updatedGoal);
        return unescapeData(updatedGoal as unknown as Record<string, unknown>) as unknown as Goal;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'updateGoalOnlineFallback', goalId: id });
        }
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
      updateCachedRecord(STORAGE_KEYS.GOALS, userId, id, updatedGoal);
      enqueueMutation(userId, {
        resource: 'goals',
        method: 'PUT',
        entityId: id,
        body: sanitizedUpdates,
      });
      return unescapeData(updatedGoal as unknown as Record<string, unknown>) as unknown as Goal;
  } catch (error) {
    logError(error as Error, { operation: 'updateGoal', goalId: id });
    throw new StorageError('Failed to update goal');
  }
}

export async function deleteGoal(id: string): Promise<boolean> {
  try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      let shouldQueueDelete = !isOnline();
      if (isOnline()) {
        try {
        await syncPendingChanges();
        await apiRequest<{ success: true }>(`goals?id=${id}`, 'DELETE');
        shouldQueueDelete = false;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          shouldQueueDelete = true;
          logError(error as Error, { operation: 'deleteGoalOnlineFallback', goalId: id });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      deleteCachedGoalCascade(userId, id);
      if (shouldQueueDelete) {
        enqueueMutation(userId, {
          resource: 'goals',
          method: 'DELETE',
          entityId: id,
        });
      }
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
      await syncPendingChanges();
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
        try {
        await syncPendingChanges();
        const newMilestone = await apiRequest<Milestone>('milestones', 'POST', sanitizedMilestone);
        addCachedRecord(STORAGE_KEYS.MILESTONES, userId, newMilestone);
        return unescapeData(newMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'createMilestoneOnlineFallback' });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      const newMilestone = {
        ...sanitizedMilestone,
        id: createClientId('temp_milestone'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addCachedRecord(STORAGE_KEYS.MILESTONES, userId, newMilestone);
      enqueueMutation(userId, {
        resource: 'milestones',
        method: 'POST',
        entityId: newMilestone.id,
        body: sanitizedMilestone,
      });
      return unescapeData(newMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
  } catch (error) {
    logError(error as Error, { operation: 'createMilestone' });
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
        try {
        await syncPendingChanges();
        const updatedMilestone = await apiRequest<Milestone>('milestones', 'PUT', { id, ...sanitizedUpdates });
        updateCachedRecord(STORAGE_KEYS.MILESTONES, userId, id, updatedMilestone);
        return unescapeData(updatedMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'updateMilestoneOnlineFallback', milestoneId: id });
        }
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
      updateCachedRecord(STORAGE_KEYS.MILESTONES, userId, id, updatedMilestone);
      enqueueMutation(userId, {
        resource: 'milestones',
        method: 'PUT',
        entityId: id,
        body: sanitizedUpdates,
      });
      return unescapeData(updatedMilestone as unknown as Record<string, unknown>) as unknown as Milestone;
  } catch (error) {
    logError(error as Error, { operation: 'updateMilestone', milestoneId: id });
    throw new StorageError('Failed to update milestone');
  }
}

export async function deleteMilestone(id: string): Promise<boolean> {
  try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      let shouldQueueDelete = !isOnline();
      if (isOnline()) {
        try {
        await syncPendingChanges();
        await apiRequest<{ success: true }>(`milestones?id=${id}`, 'DELETE');
        shouldQueueDelete = false;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          shouldQueueDelete = true;
          logError(error as Error, { operation: 'deleteMilestoneOnlineFallback', milestoneId: id });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      deleteCachedMilestone(userId, id);
      if (shouldQueueDelete) {
        enqueueMutation(userId, {
          resource: 'milestones',
          method: 'DELETE',
          entityId: id,
        });
      }
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
      await syncPendingChanges();
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
        try {
        await syncPendingChanges();
        const newNote = await apiRequest<Note>('notes', 'POST', {
          ...sanitizedNote,
          isPinned: sanitizedNote.isPinned ?? false
        });
        addCachedRecord(STORAGE_KEYS.NOTES, userId, newNote);
        return unescapeData(newNote as unknown as Record<string, unknown>) as unknown as Note;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'createNoteOnlineFallback' });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      const newNote = {
        ...sanitizedNote,
        id: createClientId('temp_note'),
        isPinned: sanitizedNote.isPinned ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addCachedRecord(STORAGE_KEYS.NOTES, userId, newNote);
      enqueueMutation(userId, {
        resource: 'notes',
        method: 'POST',
        entityId: newNote.id,
        body: {
          ...sanitizedNote,
          isPinned: sanitizedNote.isPinned ?? false,
        },
      });
      return unescapeData(newNote as unknown as Record<string, unknown>) as unknown as Note;
  } catch (error) {
    logError(error as Error, { operation: 'createNote' });
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
        try {
        await syncPendingChanges();
        const updatedNote = await apiRequest<Note>('notes', 'PUT', { id, ...sanitizedUpdates });
        updateCachedRecord(STORAGE_KEYS.NOTES, userId, id, updatedNote);
        return unescapeData(updatedNote as unknown as Record<string, unknown>) as unknown as Note;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'updateNoteOnlineFallback', noteId: id });
        }
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
      updateCachedRecord(STORAGE_KEYS.NOTES, userId, id, updatedNote);
      enqueueMutation(userId, {
        resource: 'notes',
        method: 'PUT',
        entityId: id,
        body: sanitizedUpdates,
      });
      return unescapeData(updatedNote as unknown as Record<string, unknown>) as unknown as Note;
  } catch (error) {
    logError(error as Error, { operation: 'updateNote', noteId: id });
    throw new StorageError('Failed to update note');
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      let shouldQueueDelete = !isOnline();
      if (isOnline()) {
        try {
        await syncPendingChanges();
        await apiRequest<{ success: true }>(`notes?id=${id}`, 'DELETE');
        shouldQueueDelete = false;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          shouldQueueDelete = true;
          logError(error as Error, { operation: 'deleteNoteOnlineFallback', noteId: id });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      deleteCachedRecord(STORAGE_KEYS.NOTES, userId, id);
      if (shouldQueueDelete) {
        enqueueMutation(userId, {
          resource: 'notes',
          method: 'DELETE',
          entityId: id,
        });
      }
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
      await syncPendingChanges();
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

export async function getTodoOccurrences(): Promise<TodoOccurrence[]> {
  try {
    if (isOnline()) {
      return await apiRequest<TodoOccurrence[]>('todo-occurrences', 'GET');
    }
    return [];
  } catch (error) {
    logError(error as Error, { operation: 'getTodoOccurrences' });
    return [];
  }
}

export async function getWorkspaceExport(): Promise<WorkspaceExport> {
  return apiRequest<WorkspaceExport>('export', 'GET');
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
        try {
        await syncPendingChanges();
        const newTodo = await apiRequest<Todo>('todos', 'POST', {
          ...sanitizedTodo,
          completed: false
        });
        addCachedRecord(STORAGE_KEYS.TODOS, userId, newTodo);
        return unescapeData(newTodo as unknown as Record<string, unknown>) as unknown as Todo;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'createTodoOnlineFallback' });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      const newTodo = {
        ...sanitizedTodo,
        id: createClientId('temp_todo'),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addCachedRecord(STORAGE_KEYS.TODOS, userId, newTodo);
      enqueueMutation(userId, {
        resource: 'todos',
        method: 'POST',
        entityId: newTodo.id,
        body: {
          ...sanitizedTodo,
          completed: false,
        },
      });
      return unescapeData(newTodo as unknown as Record<string, unknown>) as unknown as Todo;
  } catch (error) {
    logError(error as Error, { operation: 'createTodo' });
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
        try {
        await syncPendingChanges();
        const updatedTodo = await apiRequest<Todo>('todos', 'PUT', { id, ...sanitizedUpdates });
        updateCachedRecord(STORAGE_KEYS.TODOS, userId, id, updatedTodo);
        return unescapeData(updatedTodo as unknown as Record<string, unknown>) as unknown as Todo;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'updateTodoOnlineFallback', todoId: id });
        }
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
      updateCachedRecord(STORAGE_KEYS.TODOS, userId, id, updatedTodo);
      enqueueMutation(userId, {
        resource: 'todos',
        method: 'PUT',
        entityId: id,
        body: sanitizedUpdates,
      });
      return unescapeData(updatedTodo as unknown as Record<string, unknown>) as unknown as Todo;
  } catch (error) {
    logError(error as Error, { operation: 'updateTodo', todoId: id });
    throw new StorageError('Failed to update todo');
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      let shouldQueueDelete = !isOnline();
      if (isOnline()) {
        try {
        await syncPendingChanges();
        await apiRequest<{ success: true }>(`todos?id=${id}`, 'DELETE');
        shouldQueueDelete = false;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          shouldQueueDelete = true;
          logError(error as Error, { operation: 'deleteTodoOnlineFallback', todoId: id });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      deleteCachedRecord(STORAGE_KEYS.TODOS, userId, id);
      if (shouldQueueDelete) {
        enqueueMutation(userId, {
          resource: 'todos',
          method: 'DELETE',
          entityId: id,
        });
      }
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
      await syncPendingChanges();
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
      accomplishments: normalizeCheckInArray(checkIn.accomplishments),
      challenges: normalizeCheckInArray(checkIn.challenges),
      goals: normalizeCheckInArray(checkIn.goals),
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
        try {
        await syncPendingChanges();
        const newCheckIn = await apiRequest<CheckIn>('checkins', 'POST', sanitizedCheckIn);
        addCachedRecord(STORAGE_KEYS.CHECKINS, userId, newCheckIn);
        return unescapeData(newCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'createCheckInOnlineFallback' });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      const newCheckIn = {
        ...sanitizedCheckIn,
        id: createClientId('temp_checkin'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addCachedRecord(STORAGE_KEYS.CHECKINS, userId, newCheckIn);
      enqueueMutation(userId, {
        resource: 'checkins',
        method: 'POST',
        entityId: newCheckIn.id,
        body: sanitizedCheckIn,
      });
      return unescapeData(newCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
  } catch (error) {
    logError(error as Error, { operation: 'createCheckIn' });
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
      ...(updates.accomplishments !== undefined && { accomplishments: normalizeCheckInArray(updates.accomplishments) }),
      ...(updates.challenges !== undefined && { challenges: normalizeCheckInArray(updates.challenges) }),
      ...(updates.goals !== undefined && { goals: normalizeCheckInArray(updates.goals) }),
    };

    const sanitizedUpdates = sanitizeData(processedUpdates);

      if (isOnline()) {
        try {
        await syncPendingChanges();
        const updatedCheckIn = await apiRequest<CheckIn>('checkins', 'PUT', { id, ...sanitizedUpdates });
        updateCachedRecord(STORAGE_KEYS.CHECKINS, userId, id, updatedCheckIn);
        return unescapeData(updatedCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          logError(error as Error, { operation: 'updateCheckInOnlineFallback', checkInId: id });
        }
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
      updateCachedRecord(STORAGE_KEYS.CHECKINS, userId, id, updatedCheckIn);
      enqueueMutation(userId, {
        resource: 'checkins',
        method: 'PUT',
        entityId: id,
        body: sanitizedUpdates,
      });
      return unescapeData(updatedCheckIn as unknown as Record<string, unknown>) as unknown as CheckIn;
  } catch (error) {
    logError(error as Error, { operation: 'updateCheckIn', checkInId: id });
    throw new StorageError('Failed to update check-in');
  }
}

export async function deleteCheckIn(id: string): Promise<boolean> {
  try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      let shouldQueueDelete = !isOnline();
      if (isOnline()) {
        try {
        await syncPendingChanges();
        await apiRequest<{ success: true }>(`checkins?id=${id}`, 'DELETE');
        shouldQueueDelete = false;
        } catch (error) {
          if (!shouldQueueOfflineMutation(error)) {
            throw error;
          }
          shouldQueueDelete = true;
          logError(error as Error, { operation: 'deleteCheckInOnlineFallback', checkInId: id });
        }
      }

    if (!userId) {
      throw new StorageError('No user ID found');
    }

      deleteCachedRecord(STORAGE_KEYS.CHECKINS, userId, id);
      if (shouldQueueDelete) {
        enqueueMutation(userId, {
          resource: 'checkins',
          method: 'DELETE',
          entityId: id,
        });
      }
      return true;
  } catch (error) {
    logError(error as Error, { operation: 'deleteCheckIn', checkInId: id });
    throw new StorageError('Failed to delete check-in');
  }
}
