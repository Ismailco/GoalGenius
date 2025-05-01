import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { todos } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'edge';

type TodoInput = {
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  completed?: boolean;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const completed = searchParams.get('completed');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
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
    const data = await request.json() as TodoInput;

    // Validate required fields
    if (!data.userId || !data.title || !data.priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate priority
    if (!['low', 'medium', 'high'].includes(data.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    const newTodo = await db.insert(todos).values({
      id: uuidv4(),
      userId: data.userId,
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
    const data = await request.json() as Partial<TodoInput> & { id: string };

    if (!data.id) {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = data;

    const updatedTodo = await db.update(todos)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    const deletedTodo = await db.delete(todos)
      .where(eq(todos.id, id))
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
