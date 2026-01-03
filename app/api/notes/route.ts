import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { notes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import { readJsonBodyWithLimit } from '@/lib/server/request-body';

export const runtime = "edge";

type NoteInput = {
  userId: string;
  title: string;
  content: string;
  category?: string;
  isPinned?: boolean;
};

const createNoteSchema = z
  .object({
    title: z.string().min(1),
    content: z.string().min(1),
    category: z.string().optional(),
    isPinned: z.boolean().optional(),
    userId: z.string().optional(),
  })
  .passthrough();

const updateNoteSchema = createNoteSchema.partial().extend({ id: z.string().min(1) }).passthrough();

const MAX_BODY_BYTES = 2 * 1024 * 1024;

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

    const bodyResult = await readJsonBodyWithLimit(request, MAX_BODY_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const parsed = createNoteSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data as unknown as NoteInput;

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

    const bodyResult = await readJsonBodyWithLimit(request, MAX_BODY_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const parsed = updateNoteSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data as unknown as Partial<NoteInput> & { id: string };

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
