import pool from "@/lib/db";
import { getCurrentUserId } from "@/lib/get-current-user";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

function isValidCompletionDate(value: string): boolean {
  if (!DATE_PATTERN.test(value) && !DATETIME_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (DATE_PATTERN.test(value)) {
    return date.toISOString().slice(0, 10) === value;
  }

  return true;
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]/history/[recordId]">
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, recordId } = await ctx.params;

    if (
      !UUID_PATTERN.test(propertyId) ||
      !UUID_PATTERN.test(recordId)
    ) {
      return Response.json(
        { error: "Completion record not found" },
        { status: 404 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const allowedFields = ["completedAt", "notes", "actualCost"];

    if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
      return Response.json(
        { error: "Unknown field provided" },
        { status: 400 }
      );
    }

    if (Object.keys(data).length === 0) {
      return Response.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    const addUpdate = (
      column: string,
      value: string | number | null
    ) => {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    };

    if ("completedAt" in data) {
      if (
        typeof data.completedAt !== "string" ||
        !data.completedAt.trim() ||
        !isValidCompletionDate(data.completedAt)
      ) {
        return Response.json(
          { error: "Invalid completion date" },
          { status: 400 }
        );
      }

      addUpdate(
        "completed_at",
        new Date(data.completedAt).toISOString()
      );
    }

    if ("notes" in data) {
      if (data.notes !== null && typeof data.notes !== "string") {
        return Response.json(
          { error: "Invalid completion notes" },
          { status: 400 }
        );
      }

      addUpdate(
        "notes",
        typeof data.notes === "string"
          ? data.notes.trim() || null
          : null
      );
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

      addUpdate("actual_cost", data.actualCost as number | null);
    }

    values.push(recordId, propertyId, userId);

    const result = await pool.query(
      `UPDATE completed_tasks AS ct
       SET ${updates.join(", ")}
       FROM properties AS p
       WHERE ct.id = $${values.length - 2}
         AND ct.property_id = $${values.length - 1}
         AND p.id = ct.property_id
         AND p.account_id = $${values.length}
       RETURNING
         ct.id,
         ct.task_id AS "taskId",
         ct.property_id AS "propertyId",
         ct.task_title AS "taskTitle",
         ct.completed_at AS "completedAt",
         ct.notes,
         ct.actual_cost AS "actualCost",
         ct.created_at AS "createdAt"`,
      values
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Completion record not found" },
        { status: 404 }
      );
    }

    return Response.json({ record: result.rows[0] });
  } catch (error) {
    console.error("Failed to update completion record:", error);

    return Response.json(
      { error: "Failed to update completion record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]/history/[recordId]">
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, recordId } = await ctx.params;

    if (
      !UUID_PATTERN.test(propertyId) ||
      !UUID_PATTERN.test(recordId)
    ) {
      return Response.json(
        { error: "Completion record not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `DELETE FROM completed_tasks AS ct
       USING properties AS p
       WHERE ct.id = $1
         AND ct.property_id = $2
         AND p.id = ct.property_id
         AND p.account_id = $3
       RETURNING ct.id`,
      [recordId, propertyId, userId]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Completion record not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Completion record deleted successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Failed to delete completion record:", error);

    return Response.json(
      { error: "Failed to delete completion record" },
      { status: 500 }
    );
  }
}
