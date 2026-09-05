import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { checkIns, goals, milestones, todos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getAuthenticatedUserId } from "@/lib/server/authenticated-user";
import { z } from "zod";
import { readJsonBodyWithLimit } from "@/lib/server/request-body";

export const runtime = "nodejs";

// Type for goal data with constrained categories and status
type GoalInput = {
  userId: string;
  title: string;
  description?: string;
  category: "health" | "career" | "learning" | "relationships";
  timeFrame: string;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  dueDate?: string;
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format");

const createGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().max(2000).optional(),
    category: z.enum(["health", "career", "learning", "relationships"]),
    timeFrame: z.enum(["short-term", "medium-term", "long-term"]),
    status: z.enum(["not-started", "in-progress", "completed"]),
    progress: z.number().int().min(0).max(100).optional(),
    dueDate: isoDate.optional(),
    userId: z.string().optional(),
  })
  ;

const updateGoalSchema = createGoalSchema
  .partial()
  .extend({ id: z.string().min(1) })
  ;

const MAX_BODY_BYTES = 2 * 1024 * 1024;

// GET /api/goals - Get all goals for a user
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get("id");
    const userGoals = await db
      .select()
      .from(goals)
      .where(id ? and(eq(goals.id, id), eq(goals.userId, userId)) : eq(goals.userId, userId));
    if (id && !userGoals.length) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(id ? userGoals[0] : userGoals);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 },
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyResult = await readJsonBodyWithLimit(request, MAX_BODY_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const parsed = createGoalSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as GoalInput;

    const newGoal = await db
      .insert(goals)
      .values({
        id: uuidv4(),
        userId,
        title: data.title,
        description: data.description,
        category: data.category,
        timeFrame: data.timeFrame,
        status: data.status,
        progress: data.progress ?? 0,
        dueDate: data.dueDate,
        // createdAt and updatedAt will use the default values from schema
      })
      .returning();

    return NextResponse.json(newGoal[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 },
    );
  }
}

// PUT /api/goals - Update a goal
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const bodyResult = await readJsonBodyWithLimit(request, MAX_BODY_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    const parsed = updateGoalSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as Partial<GoalInput> & { id: string };

    const { id, ...updateData } = data;
    delete updateData.userId;

    const updatedGoal = await db
      .update(goals)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();

    if (!updatedGoal.length) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGoal[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 },
    );
  }
}

// DELETE /api/goals - Delete a goal
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get("id");

    const idParsed = z.string().min(1).safeParse(id);
    if (!idParsed.success) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 },
      );
    }
    const validatedId = idParsed.data;

    const [existingGoal] = await db
      .select({ id: goals.id })
      .from(goals)
      .where(and(eq(goals.id, validatedId), eq(goals.userId, userId)))
      .limit(1);

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const deletedGoal = await db.batch([
      db.delete(checkIns).where(and(eq(checkIns.goalId, validatedId), eq(checkIns.userId, userId))),
      db.delete(todos).where(and(eq(todos.goalId, validatedId), eq(todos.userId, userId))),
      db.delete(milestones).where(and(eq(milestones.goalId, validatedId), eq(milestones.userId, userId))),
      db.delete(goals).where(and(eq(goals.id, validatedId), eq(goals.userId, userId))).returning(),
    ]);

    const deletedGoalRecords = deletedGoal[deletedGoal.length - 1];
    if (!Array.isArray(deletedGoalRecords) || !deletedGoalRecords.length) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 },
    );
  }
}
