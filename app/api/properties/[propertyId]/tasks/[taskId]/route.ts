
import pool from "@/lib/db";
import { getCurrentUserId } from "@/lib/get-current-user";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]/tasks/[taskId]">
) {
  let client;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const data = body as Record<string, unknown>;

    const allowedFields = [
      "title",
      "description",
      "category",
      "dueDate",
      "estimatedCost",
      "status",
      "completionNotes",
      "actualCost",
    ];

    if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
      return Response.json(
        { error: "Unknown field provided" },
        { status: 400 }
      );
    }

    const { propertyId, taskId } = await ctx.params;

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    const addUpdate = (
      column: string,
      value: string | number | null
    ) => {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    };

    if ("title" in data) {
      if (typeof data.title !== "string" || !data.title.trim()) {
        return Response.json(
          { error: "A valid title is required" },
          { status: 400 }
        );
      }

      addUpdate("title", data.title.trim());
    }

    for (const field of ["description", "category"] as const) {
      if (field in data) {
        if (data[field] !== null && typeof data[field] !== "string") {
          return Response.json(
            { error: `Invalid ${field}` },
            { status: 400 }
          );
        }

        addUpdate(
          field,
          typeof data[field] === "string"
            ? data[field].trim() || null
            : null
        );
      }
    }

    if ("dueDate" in data) {
      if (
        typeof data.dueDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)
      ) {
        return Response.json(
          { error: "Invalid due date" },
          { status: 400 }
        );
      }

      const date = new Date(`${data.dueDate}T00:00:00.000Z`);

      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== data.dueDate
      ) {
        return Response.json(
          { error: "Invalid due date" },
          { status: 400 }
        );
      }

      addUpdate("due_date", data.dueDate);
    }

    if ("estimatedCost" in data) {
      if (
        data.estimatedCost !== null &&
        (typeof data.estimatedCost !== "number" ||
          !Number.isFinite(data.estimatedCost) ||
          data.estimatedCost < 0)
      ) {
        return Response.json(
          { error: "Invalid estimated cost" },
          { status: 400 }
        );
      }

      addUpdate("estimated_cost", data.estimatedCost as number | null);
    }

    if ("status" in data) {
      if (data.status !== "pending" && data.status !== "completed") {
        return Response.json(
          { error: "Invalid task status" },
          { status: 400 }
        );
      }

      addUpdate("status", data.status);
    }

    let completionNotes: string | null = null;
    let actualCost: number | null = null;

    if ("completionNotes" in data) {
      if (
        data.completionNotes !== null &&
        typeof data.completionNotes !== "string"
      ) {
        return Response.json(
          { error: "Invalid completion notes" },
          { status: 400 }
        );
      }

      completionNotes =
        typeof data.completionNotes === "string"
          ? data.completionNotes.trim() || null
          : null;
    }

    if ("actualCost" in data) {
      if (
        data.actualCost !== null &&
        (typeof data.actualCost !== "number" ||
          !Number.isFinite(data.actualCost) ||
          data.actualCost < 0)
      ) {
        return Response.json(
          { error: "Invalid actual cost" },
          { status: 400 }
        );
      }

      actualCost = data.actualCost as number | null;
    }

    if (
      ("completionNotes" in data || "actualCost" in data) &&
      data.status !== "completed"
    ) {
      return Response.json(
        { error: "Completion details require status to be completed" },
        { status: 400 }
      );
    }

    if (updates.length === 0) {
      return Response.json(
        { error: "No task changes provided" },
        { status: 400 }
      );
    }

    client = await pool.connect();

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT t.id, t.status, t.title
       FROM tasks t
       JOIN properties p ON p.id = t.property_id
       WHERE t.id = $1
         AND t.property_id = $2
         AND p.account_id = $3
       FOR UPDATE OF t`,
      [taskId, propertyId, userId]
    );

    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const previousStatus = existing.rows[0].status;

    values.push(taskId, propertyId);

    const result = await client.query(
      `UPDATE tasks
       SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length - 1}
         AND property_id = $${values.length}
       RETURNING
         id,
         property_id AS "propertyId",
         title,
         description,
         category,
         TO_CHAR(due_date, 'YYYY-MM-DD') AS "dueDate",
         estimated_cost AS "estimatedCost",
         status,
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      values
    );

    if (
      previousStatus === "pending" &&
      result.rows[0].status === "completed"
    ) {
      await client.query(
        `INSERT INTO completed_tasks (
          task_id,
          property_id,
          task_title,
          notes,
          actual_cost
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          taskId,
          propertyId,
          result.rows[0].title,
          completionNotes,
          actualCost,
        ]
      );
    }

    await client.query("COMMIT");

    return Response.json({ task: result.rows[0] });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back task update:", rollbackError);
      }
    }

    console.error("Failed to update maintenance task:", error);

    return Response.json(
      { error: "Failed to update maintenance task" },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]/tasks/[taskId]">
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { propertyId, taskId } = await ctx.params;

    const result = await pool.query(
      `DELETE FROM tasks t
       USING properties p
       WHERE t.id = $1
         AND t.property_id = $2
         AND p.id = t.property_id
         AND p.account_id = $3
       RETURNING t.id`,
      [taskId, propertyId, userId]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Maintenance task deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete maintenance task:", error);

    return Response.json(
      { error: "Failed to delete maintenance task" },
      { status: 500 }
    );
  }
}
