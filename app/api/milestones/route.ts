import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { milestones } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth/auth';

export const runtime = "nodejs";

type MilestoneInput = {
  goalId: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const goalId = searchParams.get('goalId');

    // Always scope to current user; optionally filter by goalId
    const conditions = [eq(milestones.userId, userId)];
    if (goalId) {
      conditions.push(eq(milestones.goalId, goalId));
    }

    // Apply all conditions at once
    const userMilestones = await db
      .select()
      .from(milestones)
      .where(and(...conditions));

    return NextResponse.json(userMilestones);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json() as MilestoneInput;

    // Validate required fields
    if (!data.goalId || !data.title || !data.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newMilestone = await db.insert(milestones).values({
      id: uuidv4(),
      goalId: data.goalId,
      userId,
      title: data.title,
      description: data.description,
      date: data.date,
    }).returning();

    return NextResponse.json(newMilestone[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json() as Partial<MilestoneInput> & { id: string };

    if (!data.id) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    const { id, userId: _ignoredUserId, ...updateData } = data;

    const updatedMilestone = await db.update(milestones)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(milestones.id, id), eq(milestones.userId, userId)))
      .returning();

    if (!updatedMilestone.length) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMilestone[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update milestone' },
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
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    const deletedMilestone = await db.delete(milestones)
      .where(and(eq(milestones.id, id), eq(milestones.userId, userId)))
      .returning();

    if (!deletedMilestone.length) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
