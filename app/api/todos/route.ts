import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { todos, goals, milestones, todoOccurrences } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { readJsonBodyWithLimit } from "@/lib/server/request-body";
import { getAuthenticatedUserId } from "@/lib/server/authenticated-user";
import { nextOccurrenceDate } from "@/lib/domain/recurrence";
import type { TodoRecurrence, TodoReminder } from "@/app/types";

export const runtime = "nodejs";

type TodoInput = {
  userId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
  completed?: boolean;
  recurrence: TodoRecurrence;
  reminder: TodoReminder;
  goalId?: string | null;
  milestoneId?: string | null;
};

const createTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().max(2000).optional(),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format").nullable().optional(),
    category: z.string().max(80).optional(),
    completed: z.boolean().optional(),
    recurrence: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
    reminder: z.enum(["none", "at_due", "15m", "1h", "1d"]).optional(),
    userId: z.string().optional(),
    goalId: z.string().min(1).nullable().optional(),
    milestoneId: z.string().min(1).nullable().optional(),
  })
  ;

const updateTodoSchema = createTodoSchema
  .partial()
  .extend({ id: z.string().min(1) })
  ;

const MAX_BODY_BYTES = 2 * 1024 * 1024;

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const completed = searchParams.get("completed");
    const id = searchParams.get("id");

    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build conditions array
    const conditions = [eq(todos.userId, userId)];

    // Add completed filter if provided
    if (completed !== null) {
      conditions.push(eq(todos.completed, completed === "true"));
    }
    if (id) conditions.push(eq(todos.id, id));

    const userTodos = await db
      .select()
      .from(todos)
      .where(and(...conditions));

    if (id && !userTodos.length) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }
    return NextResponse.json(id ? userTodos[0] : userTodos);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
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

    const parsed = createTodoSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as TodoInput;

    if (data.milestoneId && !data.goalId) {
      return NextResponse.json(
        { error: "A milestone task must also include its goal" },
        { status: 400 },
      );
    }
    if (data.goalId) {
      const [goal] = await db
        .select({ id: goals.id })
        .from(goals)
        .where(and(eq(goals.id, data.goalId), eq(goals.userId, userId)))
        .limit(1);
      if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    if (data.milestoneId) {
      const [milestone] = await db
        .select({ id: milestones.id, goalId: milestones.goalId })
        .from(milestones)
        .where(and(eq(milestones.id, data.milestoneId), eq(milestones.userId, userId)))
        .limit(1);
      if (!milestone || milestone.goalId !== data.goalId) {
        return NextResponse.json({ error: "Milestone does not belong to this goal" }, { status: 400 });
      }
    }

    const newTodo = await db
      .insert(todos)
      .values({
        id: uuidv4(),
        userId,
        goalId: data.goalId ?? null,
        milestoneId: data.milestoneId ?? null,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        category: data.category,
        completed: data.completed ?? false,
        recurrence: data.recurrence ?? "none",
        reminder: data.reminder ?? "none",
      })
      .returning();

    return NextResponse.json(newTodo[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create todo" },
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

    const parsed = updateTodoSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data as unknown as Partial<TodoInput> & { id: string };

    const { id, ...updateData } = data;
    delete updateData.userId;

    const [existingTodo] = await db
      .select({
        goalId: todos.goalId,
        milestoneId: todos.milestoneId,
        completed: todos.completed,
        recurrence: todos.recurrence,
        dueDate: todos.dueDate,
      })
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);
    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const nextGoalId = data.goalId !== undefined ? data.goalId : existingTodo.goalId;
    const nextMilestoneId = data.milestoneId !== undefined ? data.milestoneId : existingTodo.milestoneId;

    if (nextMilestoneId && !nextGoalId) {
      return NextResponse.json({ error: "A milestone task must also include its goal" }, { status: 400 });
    }
    if (nextGoalId) {
      const [goal] = await db
        .select({ id: goals.id })
        .from(goals)
        .where(and(eq(goals.id, nextGoalId), eq(goals.userId, userId)))
        .limit(1);
      if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    if (nextMilestoneId) {
      const [milestone] = await db
        .select({ id: milestones.id, goalId: milestones.goalId })
        .from(milestones)
        .where(and(eq(milestones.id, nextMilestoneId), eq(milestones.userId, userId)))
        .limit(1);
      if (!milestone || milestone.goalId !== nextGoalId) {
        return NextResponse.json({ error: "Milestone does not belong to this goal" }, { status: 400 });
      }
    }

    if (data.completed === true && !existingTodo.completed && existingTodo.recurrence !== "none") {
      const occurrenceDate = existingTodo.dueDate ?? new Date().toISOString().slice(0, 10);
      const [existingOccurrence] = await db
        .select({ id: todoOccurrences.id })
        .from(todoOccurrences)
        .where(and(eq(todoOccurrences.todoId, id), eq(todoOccurrences.occurrenceDate, occurrenceDate)))
        .limit(1);

      if (!existingOccurrence) {
        await db.insert(todoOccurrences).values({
          id: uuidv4(),
          todoId: id,
          occurrenceDate,
          completedAt: new Date(),
        }).onConflictDoNothing();
      }

      const nextDueDate = nextOccurrenceDate(
        occurrenceDate,
        existingTodo.recurrence as TodoRecurrence,
      );
      const recurringTodo = await db
        .update(todos)
        .set({
          ...updateData,
          completed: false,
          dueDate: nextDueDate,
          updatedAt: new Date(),
        })
        .where(and(eq(todos.id, id), eq(todos.userId, userId)))
        .returning();

      return NextResponse.json(recurringTodo[0]);
    }

    const updatedTodo = await db
      .update(todos)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!updatedTodo.length) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTodo[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to update todo" },
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

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 },
      );
    }

    const deletedTodo = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!deletedTodo.length) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 },
    );
  }
}
