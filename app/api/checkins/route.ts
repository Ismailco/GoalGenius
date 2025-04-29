import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { checkIns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'edge';
type CheckInInput = {
  userId: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  energy: 'high' | 'medium' | 'low';
  accomplishments: string; // JSON string array
  challenges: string; // JSON string array
  goals: string; // JSON string array
  notes?: string;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userCheckIns = await db.select().from(checkIns).where(eq(checkIns.userId, userId));
    return NextResponse.json(userCheckIns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as CheckInInput;

    // Validate required fields
    if (!data.userId || !data.date || !data.mood || !data.energy ||
        !data.accomplishments || !data.challenges || !data.goals) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newCheckIn = await db.insert(checkIns).values({
      id: uuidv4(),
      userId: data.userId,
      date: data.date,
      mood: data.mood,
      energy: data.energy,
      accomplishments: data.accomplishments,
      challenges: data.challenges,
      goals: data.goals,
      notes: data.notes,
    }).returning();

    return NextResponse.json(newCheckIn[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json() as Partial<CheckInInput> & { id: string };

    if (!data.id) {
      return NextResponse.json(
        { error: 'Check-in ID is required' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = data;

    const updatedCheckIn = await db.update(checkIns)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(checkIns.id, id))
      .returning();

    if (!updatedCheckIn.length) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCheckIn[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update check-in' },
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
        { error: 'Check-in ID is required' },
        { status: 400 }
      );
    }

    const deletedCheckIn = await db.delete(checkIns)
      .where(eq(checkIns.id, id))
      .returning();

    if (!deletedCheckIn.length) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete check-in' },
      { status: 500 }
    );
  }
}
