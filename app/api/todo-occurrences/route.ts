import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/db';
import { todoOccurrences, todos } from '@/lib/db/schema';
import { getAuthenticatedUserId } from '@/lib/server/authenticated-user';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todoId = request.nextUrl.searchParams.get('todoId');
    const conditions = [eq(todos.userId, userId)];
    if (todoId) conditions.push(eq(todoOccurrences.todoId, todoId));

    const occurrences = await db
      .select({
        id: todoOccurrences.id,
        todoId: todoOccurrences.todoId,
        occurrenceDate: todoOccurrences.occurrenceDate,
        completedAt: todoOccurrences.completedAt,
        createdAt: todoOccurrences.createdAt,
      })
      .from(todoOccurrences)
      .innerJoin(todos, eq(todoOccurrences.todoId, todos.id))
      .where(and(...conditions));

    return NextResponse.json(occurrences);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch task completion history' }, { status: 500 });
  }
}
