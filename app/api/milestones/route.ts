import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { milestones } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// export const runtime = 'edge';

type MilestoneInput = {
  goalId: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const goalId = searchParams.get('goalId');

    if (!userId && !goalId) {
      return NextResponse.json(
        { error: 'Either User ID or Goal ID is required' },
        { status: 400 }
      );
    }

    // Build conditions array
    const conditions = [];
    if (userId) {
      conditions.push(eq(milestones.userId, userId));
    }
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
    const data = await request.json() as MilestoneInput;

    // Validate required fields
    if (!data.goalId || !data.userId || !data.title || !data.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newMilestone = await db.insert(milestones).values({
      id: uuidv4(),
      goalId: data.goalId,
      userId: data.userId,
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
    const data = await request.json() as Partial<MilestoneInput> & { id: string };

    if (!data.id) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = data;

    const updatedMilestone = await db.update(milestones)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, id))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    const deletedMilestone = await db.delete(milestones)
      .where(eq(milestones.id, id))
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
