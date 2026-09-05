import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getAuthenticatedUserId } from '@/lib/server/authenticated-user';
import { db } from '@/lib/db/db';
import { checkIns, goals, milestones, notes, todoOccurrences, todos, user } from '@/lib/db/schema';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [profile, userGoals, userMilestones, userTodos, userNotes, userCheckIns, occurrences] = await Promise.all([
      db.select({ name: user.name, email: user.email }).from(user).where(eq(user.id, userId)).limit(1),
      db.select().from(goals).where(eq(goals.userId, userId)),
      db.select().from(milestones).where(eq(milestones.userId, userId)),
      db.select().from(todos).where(eq(todos.userId, userId)),
      db.select().from(notes).where(eq(notes.userId, userId)),
      db.select().from(checkIns).where(eq(checkIns.userId, userId)),
      db.select({
        id: todoOccurrences.id,
        todoId: todoOccurrences.todoId,
        occurrenceDate: todoOccurrences.occurrenceDate,
        completedAt: todoOccurrences.completedAt,
        createdAt: todoOccurrences.createdAt,
      }).from(todoOccurrences).innerJoin(todos, eq(todoOccurrences.todoId, todos.id)).where(and(eq(todos.userId, userId))),
    ]);

    return NextResponse.json({
      format: 'goalgenius-export',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        profile: profile[0] ?? null,
        goals: userGoals,
        milestones: userMilestones,
        tasks: userTodos,
        taskOccurrences: occurrences,
        notes: userNotes,
        checkIns: userCheckIns,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export workspace data' }, { status: 500 });
  }
}
