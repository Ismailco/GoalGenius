import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { goals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Type for goal data with constrained categories and status
type GoalInput = {
	userId: string;
	title: string;
	description?: string;
	category: 'health' | 'career' | 'learning' | 'relationships';
	timeFrame: string;
	status: 'not-started' | 'in-progress' | 'completed';
	progress: number;
	dueDate?: string;
};

// GET /api/goals - Get all goals for a user
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
		}

		const userGoals = await db.select().from(goals).where(eq(goals.userId, userId));
		return NextResponse.json(userGoals);
	} catch (error) {
		return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
	}
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
	try {
		const data = await request.json() as GoalInput;

		// Validate required fields
		if (!data.userId || !data.title || !data.category || !data.timeFrame || !data.status) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const newGoal = await db.insert(goals).values({
			id: uuidv4(),
			userId: data.userId,
			title: data.title,
			description: data.description,
			category: data.category,
			timeFrame: data.timeFrame,
			status: data.status,
			progress: data.progress || 0,
			dueDate: data.dueDate,
			// createdAt and updatedAt will use the default values from schema
		}).returning();

		return NextResponse.json(newGoal[0], { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
	}
}

// PUT /api/goals - Update a goal
export async function PUT(request: NextRequest) {
	try {
		const data = await request.json() as Partial<GoalInput> & { id: string };

		if (!data.id) {
			return NextResponse.json(
				{ error: 'Goal ID is required' },
				{ status: 400 }
			);
		}

		const { id, ...updateData } = data;

		const updatedGoal = await db.update(goals)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(goals.id, id))
			.returning();

		if (!updatedGoal.length) {
			return NextResponse.json(
				{ error: 'Goal not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(updatedGoal[0]);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to update goal' },
			{ status: 500 }
		);
	}
}

// DELETE /api/goals - Delete a goal
export async function DELETE(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json(
				{ error: 'Goal ID is required' },
				{ status: 400 }
			);
		}

		const deletedGoal = await db.delete(goals)
			.where(eq(goals.id, id))
			.returning();

		if (!deletedGoal.length) {
			return NextResponse.json(
				{ error: 'Goal not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete goal' },
			{ status: 500 }
		);
	}
}
