import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { todos } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import { readJsonBodyWithLimit } from '@/lib/server/request-body';

export const runtime = "edge";

type TodoInput = {
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  completed?: boolean;
};

const createTodoSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.string().optional(),
    category: z.string().optional(),
    completed: z.boolean().optional(),
    userId: z.string().optional(),
  })
  .passthrough();

const updateTodoSchema = createTodoSchema.partial().extend({ id: z.string().min(1) }).passthrough();

const MAX_BODY_BYTES = 2 * 1024 * 1024;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const completed = searchParams.get('completed');

    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build conditions array
    const conditions = [eq(todos.userId, userId)];

    // Add completed filter if provided
    if (completed !== null) {
      conditions.push(eq(todos.completed, completed === 'true'));
    }

    const userTodos = await db
      .select()
      .from(todos)
      .where(and(...conditions));

    return NextResponse.json(userTodos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyResult = await readJsonBodyWithLimit(request, MAX_BODY_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const parsed = createTodoSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data as unknown as TodoInput;

    const newTodo = await db.insert(todos).values({
      id: uuidv4(),
      userId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      category: data.category,
      completed: data.completed ?? false,
    }).returning();

    return NextResponse.json(newTodo[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bodyResult = await readJsonBodyWithLimit(request, MAX_BODY_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const parsed = updateTodoSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data as unknown as Partial<TodoInput> & { id: string };

    const { id, userId: _ignoredUserId, ...updateData } = data;

    const updatedTodo = await db.update(todos)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!updatedTodo.length) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTodo[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    const deletedTodo = await db.delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!deletedTodo.length) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
