import { Goal, Milestone } from '@/app/types';
import { schema } from './schema';
import './types';

// Initialize tables only in production environment
export async function initDB() {
  // Skip initialization during build
  if (process.env.NODE_ENV === 'production' && typeof DB !== 'undefined') {
    try {
      await DB.batch([
        DB.prepare(schema.goals),
        DB.prepare(schema.milestones),
      ]);
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }
}

// Only call initDB in production environment
if (process.env.NODE_ENV === 'production') {
  initDB().catch(console.error);
}

// Goals
export async function getGoals(userId: string): Promise<Goal[]> {
  try {
    console.log('Executing getGoals query for userId:', userId);
    const stmt = DB.prepare(
      'SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC'
    );
    console.log('Statement prepared');
    const { results } = await stmt.bind(userId).all();
    console.log('Query results:', results);

    return results.map((result) => ({
      id: String(result.id),
      userId: String(result.userId),
      title: String(result.title),
      description: String(result.description || ''),
      category: String(result.category) as Goal['category'],
      timeFrame: String(result.timeFrame) as Goal['timeFrame'],
      status: String(result.status) as Goal['status'],
      progress: Number(result.progress),
      createdAt: String(result.createdAt),
      updatedAt: String(result.updatedAt),
    }));
  } catch (error) {
    console.error('Error in getGoals:', error);
    throw error;
  }
}

export async function getGoal(id: string): Promise<Goal | null> {
  const stmt = DB.prepare('SELECT * FROM goals WHERE id = ?');
  const result = await stmt.bind(id).first();
  if (!result) return null;

  return {
    id: String(result.id),
    userId: String(result.userId),
    title: String(result.title),
    description: String(result.description || ''),
    category: String(result.category) as Goal['category'],
    timeFrame: String(result.timeFrame) as Goal['timeFrame'],
    status: String(result.status) as Goal['status'],
    progress: Number(result.progress),
    createdAt: String(result.createdAt),
    updatedAt: String(result.updatedAt),
  };
}

export async function createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
  const id = crypto.randomUUID();
  const stmt = DB.prepare(`
    INSERT INTO goals (id, userId, title, description, category, timeFrame, status, progress)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  await stmt.bind(
    id,
    goal.userId,
    goal.title,
    goal.description,
    goal.category,
    goal.timeFrame,
    goal.status,
    goal.progress
  ).run();

  const newGoal = await getGoal(id);
  if (!newGoal) throw new Error('Failed to create goal');
  return newGoal;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
  const sets: string[] = [];
  const values: (string | number | boolean)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'createdAt') {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  });

  const stmt = DB.prepare(`
    UPDATE goals
    SET ${sets.join(', ')}, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  await stmt.bind(...values, id).run();

  const updatedGoal = await getGoal(id);
  if (!updatedGoal) throw new Error('Failed to update goal');
  return updatedGoal;
}

export async function deleteGoal(id: string): Promise<boolean> {
  const stmt = DB.prepare('DELETE FROM goals WHERE id = ?');
  const result = await stmt.bind(id).run();
  return result.success;
}

// Milestones
export async function getMilestones(userId: string): Promise<Milestone[]> {
  const stmt = DB.prepare(
    'SELECT * FROM milestones WHERE userId = ? ORDER BY date DESC'
  );
  const { results } = await stmt.bind(userId).all();
  return results.map((result) => ({
    id: String(result.id),
    userId: String(result.userId),
    title: String(result.title),
    description: String(result.description || ''),
    date: String(result.date),
    completed: Boolean(result.completed),
    createdAt: String(result.createdAt),
    updatedAt: String(result.updatedAt),
  }));
}

export async function getMilestone(id: string): Promise<Milestone | null> {
  const stmt = DB.prepare('SELECT * FROM milestones WHERE id = ?');
  const result = await stmt.bind(id).first();
  if (!result) return null;

  return {
    id: String(result.id),
    userId: String(result.userId),
    title: String(result.title),
    description: String(result.description || ''),
    date: String(result.date),
    completed: Boolean(result.completed),
    createdAt: String(result.createdAt),
    updatedAt: String(result.updatedAt),
  };
}

export async function createMilestone(milestone: Omit<Milestone, 'id'>): Promise<Milestone> {
  const id = crypto.randomUUID();
  const stmt = DB.prepare(`
    INSERT INTO milestones (id, userId, title, description, date)
    VALUES (?, ?, ?, ?, ?)
  `);

  await stmt.bind(
    id,
    milestone.userId,
    milestone.title,
    milestone.description,
    milestone.date
  ).run();

  const newMilestone = await getMilestone(id);
  if (!newMilestone) throw new Error('Failed to create milestone');
  return newMilestone;
}

export async function updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
  const sets: string[] = [];
  const values: (string | number | boolean)[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id') {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  });

  const stmt = DB.prepare(`
    UPDATE milestones
    SET ${sets.join(', ')}
    WHERE id = ?
  `);

  await stmt.bind(...values, id).run();

  const updatedMilestone = await getMilestone(id);
  if (!updatedMilestone) throw new Error('Failed to update milestone');
  return updatedMilestone;
}

export async function deleteMilestone(id: string): Promise<boolean> {
  const stmt = DB.prepare('DELETE FROM milestones WHERE id = ?');
  const result = await stmt.bind(id).run();
  return result.success;
}
