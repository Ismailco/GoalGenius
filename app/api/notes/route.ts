import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { notes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth/auth';

export const runtime = "nodejs";

type NoteInput = {
  userId: string;
  title: string;
  content: string;
  category?: string;
  isPinned?: boolean;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId));

    return NextResponse.json(userNotes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
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

    const data = await request.json() as NoteInput;

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newNote = await db.insert(notes).values({
      id: uuidv4(),
      userId,
      title: data.title,
      content: data.content,
      category: data.category,
      isPinned: data.isPinned ?? false,
    }).returning();

    return NextResponse.json(newNote[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create note' },
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

    const data = await request.json() as Partial<NoteInput> & { id: string };

    if (!data.id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const { id, userId: _ignoredUserId, ...updateData } = data;

    const updatedNote = await db.update(notes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    if (!updatedNote.length) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNote[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update note' },
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
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const deletedNote = await db.delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    if (!deletedNote.length) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
