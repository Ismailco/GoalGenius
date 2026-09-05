import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { checkIns } from "@/lib/db/schema";
import { goals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { readJsonBodyWithLimit } from "@/lib/server/request-body";
import { getAuthenticatedUserId } from "@/lib/server/authenticated-user";

export const runtime = "nodejs";

type CheckInInput = {
  userId: string;
  date: string;
  mood: "great" | "good" | "okay" | "bad" | "terrible";
  energy: "high" | "medium" | "low";
  accomplishments: string[] | string; // Can be either array or JSON string
  challenges: string[] | string; // Can be either array or JSON string
  goals: string[] | string; // Can be either array or JSON string
  notes?: string;
  goalId?: string | null;
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format");

const jsonArrayInputSchema = z.union([
  z.array(z.string().trim().min(1).max(500)).max(20),
  z.string().refine((value) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.every((item) => typeof item === "string" && item.length <= 500);
    } catch {
      return false;
    }
  }, "Expected a JSON array of short strings"),
]);

const createCheckInSchema = z
  .object({
    date: isoDate,
    mood: z.enum(["great", "good", "okay", "bad", "terrible"]),
    energy: z.enum(["high", "medium", "low"]),
    accomplishments: jsonArrayInputSchema,
    challenges: jsonArrayInputSchema,
    goals: jsonArrayInputSchema,
    notes: z.string().max(2000).optional(),
    userId: z.string().optional(),
    goalId: z.string().min(1).nullable().optional(),
  })
  ;

const updateCheckInSchema = createCheckInSchema
  .partial()
  .extend({ id: z.string().min(1) })
  ;

const MAX_BODY_BYTES = 2 * 1024 * 1024;

// Add this helper function at the top
function decodeAndParseJsonArray(
  value: string[] | string | undefined | null,
): string[] {
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
  } catch {
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
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get("id");
    const userCheckIns = await db
      .select()
      .from(checkIns)
      .where(id ? and(eq(checkIns.id, id), eq(checkIns.userId, userId)) : eq(checkIns.userId, userId));
    if (id && !userCheckIns.length) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }
    return NextResponse.json(id ? userCheckIns[0] : userCheckIns);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
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

    const parsed = createCheckInSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as CheckInInput;

    if (data.goalId) {
      const [goal] = await db
        .select({ id: goals.id })
        .from(goals)
        .where(and(eq(goals.id, data.goalId), eq(goals.userId, userId)))
        .limit(1);
      if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Create base insert data without array fields
    const baseData = {
      id: uuidv4(),
      userId,
      goalId: data.goalId ?? null,
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

    const newCheckIn = await db.insert(checkIns).values(insertData).returning();

    return NextResponse.json(newCheckIn[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create check-in" },
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

    const parsed = updateCheckInSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as Partial<CheckInInput> & {
      id: string;
    };

    const { id, ...updateFields } = data;
    delete updateFields.userId;

    if (data.goalId) {
      const [goal] = await db
        .select({ id: goals.id })
        .from(goals)
        .where(and(eq(goals.id, data.goalId), eq(goals.userId, userId)))
        .limit(1);
      if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // First, create a clean update object without the array fields
    const baseUpdate = {
      ...(updateFields.date && { date: updateFields.date }),
      ...(updateFields.mood && { mood: updateFields.mood }),
      ...(updateFields.energy && { energy: updateFields.energy }),
      ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
      ...(updateFields.goalId !== undefined && { goalId: updateFields.goalId }),
      updatedAt: new Date(),
    };

    // Then handle the array fields separately
    const arrayFields = {
      ...(updateFields.accomplishments !== undefined && {
        accomplishments: ensureJsonString(updateFields.accomplishments),
      }),
      ...(updateFields.challenges !== undefined && {
        challenges: ensureJsonString(updateFields.challenges),
      }),
      ...(updateFields.goals !== undefined && {
        goals: ensureJsonString(updateFields.goals),
      }),
    };

    // Combine both objects for the final update
    const updateData = {
      ...baseUpdate,
      ...arrayFields,
    };

    const updatedCheckIn = await db
      .update(checkIns)
      .set(updateData)
      .where(and(eq(checkIns.id, id), eq(checkIns.userId, userId)))
      .returning();

    if (!updatedCheckIn.length) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedCheckIn[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to update check-in" },
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

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get("id");

    const idParsed = z.string().min(1).safeParse(id);
    if (!idParsed.success) {
      return NextResponse.json(
        { error: "Check-in ID is required" },
        { status: 400 },
      );
    }

    const validatedId = idParsed.data;

    const deletedCheckIn = await db
      .delete(checkIns)
      .where(and(eq(checkIns.id, validatedId), eq(checkIns.userId, userId)))
      .returning();

    if (!deletedCheckIn.length) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete check-in" },
      { status: 500 },
    );
  }
}
