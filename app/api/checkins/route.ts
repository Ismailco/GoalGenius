import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { checkIns } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth/auth';

export const runtime = "nodejs";

type CheckInInput = {
  userId: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  energy: 'high' | 'medium' | 'low';
  accomplishments: string[] | string; // Can be either array or JSON string
  challenges: string[] | string; // Can be either array or JSON string
  goals: string[] | string; // Can be either array or JSON string
  notes?: string;
};

// Add this helper function at the top
function decodeAndParseJsonArray(value: string[] | string | undefined | null): string[] {
  if (!value) return [];

  // If it's already an array, return it stringified
  if (Array.isArray(value)) {
    return value;
  }

  // If it's a string, try to decode and parse it
  try {
    // First decode HTML entities
    const decoded = value.replace(/&quot;/g, '"');
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing JSON array:', e);
    return [];
  }
}

// Update the ensureJsonString function
function ensureJsonString(value: string[] | string | undefined | null): string {
  const array = decodeAndParseJsonArray(value);
  return JSON.stringify(array);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCheckIns = await db.select().from(checkIns).where(eq(checkIns.userId, userId));
    return NextResponse.json(userCheckIns);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json() as CheckInInput;

    // Validate required fields
    if (!data.date || !data.mood || !data.energy ||
        !data.accomplishments || !data.challenges || !data.goals) {
      const missingFields = ['date', 'mood', 'energy', 'accomplishments', 'challenges', 'goals']
        .filter(field => !data[field as keyof CheckInInput]);

      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate mood and energy values
    const validMoods = ['great', 'good', 'okay', 'bad', 'terrible'] as const;
    const validEnergies = ['high', 'medium', 'low'] as const;

    if (!validMoods.includes(data.mood)) {
      return NextResponse.json(
        { error: `Invalid mood value. Must be one of: ${validMoods.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validEnergies.includes(data.energy)) {
      return NextResponse.json(
        { error: `Invalid energy value. Must be one of: ${validEnergies.join(', ')}` },
        { status: 400 }
      );
    }

    // Create base insert data without array fields
    const baseData = {
      id: uuidv4(),
      userId,
      date: data.date,
      mood: data.mood,
      energy: data.energy,
      notes: data.notes,
    };

    // Handle array fields separately
    const arrayFields = {
      accomplishments: ensureJsonString(data.accomplishments),
      challenges: ensureJsonString(data.challenges),
      goals: ensureJsonString(data.goals),
    };

    // Combine both objects for the final insert
    const insertData = {
      ...baseData,
      ...arrayFields,
    };

    const newCheckIn = await db.insert(checkIns)
      .values(insertData)
      .returning();

    return NextResponse.json(newCheckIn[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create check-in', details: (error as Error).message },
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

    const data = await request.json() as Partial<CheckInInput> & { id: string };

    if (!data.id) {
      return NextResponse.json(
        { error: 'Check-in ID is required' },
        { status: 400 }
      );
    }

    const { id, userId: _ignoredUserId, ...updateFields } = data;

    // First, create a clean update object without the array fields
    const baseUpdate = {
      ...(updateFields.date && { date: updateFields.date }),
      ...(updateFields.mood && { mood: updateFields.mood }),
      ...(updateFields.energy && { energy: updateFields.energy }),
      ...(updateFields.notes && { notes: updateFields.notes }),
      updatedAt: new Date(),
    };

    // Then handle the array fields separately
    const arrayFields = {
      ...(updateFields.accomplishments !== undefined && {
        accomplishments: ensureJsonString(updateFields.accomplishments)
      }),
      ...(updateFields.challenges !== undefined && {
        challenges: ensureJsonString(updateFields.challenges)
      }),
      ...(updateFields.goals !== undefined && {
        goals: ensureJsonString(updateFields.goals)
      }),
    };

    // Combine both objects for the final update
    const updateData = {
      ...baseUpdate,
      ...arrayFields
    };

    const updatedCheckIn = await db.update(checkIns)
      .set(updateData)
      .where(and(eq(checkIns.id, id), eq(checkIns.userId, userId)))
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
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Check-in ID is required' },
        { status: 400 }
      );
    }

    const deletedCheckIn = await db.delete(checkIns)
      .where(and(eq(checkIns.id, id), eq(checkIns.userId, userId)))
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
