import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { milestones, goals, todos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { readJsonBodyWithLimit } from "@/lib/server/request-body";
import { getAuthenticatedUserId } from "@/lib/server/authenticated-user";

export const runtime = "nodejs";

type MilestoneInput = {
  goalId: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  completed?: boolean;
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format");

const createMilestoneSchema = z
  .object({
    goalId: z.string().trim().min(1),
    title: z.string().trim().min(1).max(160),
    description: z.string().max(2000).optional(),
    date: isoDate,
    userId: z.string().optional(),
    completed: z.boolean().optional(),
  })
  ;

const updateMilestoneSchema = createMilestoneSchema
  .partial()
  .extend({ id: z.string().min(1) })
  ;

const MAX_BODY_BYTES = 2 * 1024 * 1024;

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const goalId = searchParams.get("goalId");
    const id = searchParams.get("id");

    if (goalId !== null) {
      const goalIdParsed = z.string().min(1).safeParse(goalId);
      if (!goalIdParsed.success) {
        return NextResponse.json(
          { error: "Invalid request", details: goalIdParsed.error.flatten() },
          { status: 400 },
        );
      }
    }

    // Always scope to current user; optionally filter by goalId
    const conditions = [eq(milestones.userId, userId)];
    if (id) conditions.push(eq(milestones.id, id));
    if (goalId) {
      conditions.push(eq(milestones.goalId, goalId));
    }

    // Apply all conditions at once
    const userMilestones = await db
      .select()
      .from(milestones)
      .where(and(...conditions));

    if (id && !userMilestones.length) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    return NextResponse.json(id ? userMilestones[0] : userMilestones);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 },
    );
  }
}

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

    const parsed = createMilestoneSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as MilestoneInput;

    const [goal] = await db
      .select({ id: goals.id })
      .from(goals)
      .where(and(eq(goals.id, data.goalId), eq(goals.userId, userId)))
      .limit(1);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const newMilestone = await db
      .insert(milestones)
      .values({
        id: uuidv4(),
        goalId: data.goalId,
        userId,
        title: data.title,
        description: data.description,
        date: data.date,
        completed: data.completed ?? false,
      })
      .returning();

    return NextResponse.json(newMilestone[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 },
    );
  }
}

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

    const parsed = updateMilestoneSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as Partial<MilestoneInput> & {
      id: string;
    };

    const { id, ...updateData } = data;
    delete updateData.userId;

    if (data.goalId) {
      const [goal] = await db
        .select({ id: goals.id })
        .from(goals)
        .where(and(eq(goals.id, data.goalId), eq(goals.userId, userId)))
        .limit(1);
      if (!goal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }
    }

    const updatedMilestone = await db
      .update(milestones)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(milestones.id, id), eq(milestones.userId, userId)))
      .returning();

    if (!updatedMilestone.length) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedMilestone[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    const idParsed = z.string().min(1).safeParse(id);
    if (!idParsed.success) {
      return NextResponse.json(
        { error: "Milestone ID is required" },
        { status: 400 },
      );
    }

    const validatedId = idParsed.data;

    const deletedMilestone = await db.batch([
      db.update(todos).set({ milestoneId: null, updatedAt: new Date() }).where(and(eq(todos.milestoneId, validatedId), eq(todos.userId, userId))),
      db.delete(milestones).where(and(eq(milestones.id, validatedId), eq(milestones.userId, userId))).returning(),
    ]);

    const deletedMilestoneRecords = deletedMilestone[deletedMilestone.length - 1];

    if (!Array.isArray(deletedMilestoneRecords) || !deletedMilestoneRecords.length) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 },
    );
  }
}
