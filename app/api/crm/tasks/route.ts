export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTasks, addTask, updateTask } from "@/lib/crm-storage";

/**
 * GET /api/crm/tasks
 * Get tasks with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const brokerId = searchParams.get("brokerId") || undefined;
    const status = searchParams.get("status") as "pending" | "completed" | "cancelled" | null;
    const priority = searchParams.get("priority") as "low" | "medium" | "high" | null;
    const overdue = searchParams.get("overdue") === "true";

    const filters = {
      brokerId,
      status: status || undefined,
      priority: priority || undefined,
      overdue,
    };

    const tasks = await getTasks(userEmail, filters);

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/crm/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { broker_id, title, description, due_date, priority, status } = body;

    if (!broker_id || !title) {
      return NextResponse.json(
        { error: "broker_id and title are required" },
        { status: 400 }
      );
    }

    const task = await addTask(
      broker_id,
      {
        title,
        description,
        due_date,
        priority: priority || "medium",
        status: status || "pending",
      },
      userEmail
    );

    if (!task) {
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/crm/tasks
 * Update a task (typically status change)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { task_id, ...updates } = body;

    if (!task_id) {
      return NextResponse.json(
        { error: "task_id is required" },
        { status: 400 }
      );
    }

    const success = await updateTask(task_id, updates, userEmail);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

