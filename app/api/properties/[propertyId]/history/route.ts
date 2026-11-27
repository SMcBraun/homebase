import pool from "@/lib/db";
import { getCurrentUserId } from "@/lib/get-current-user";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]/history">
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId } = await ctx.params;

    if (!UUID_PATTERN.test(propertyId)) {
      return Response.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `SELECT
         ct.id,
         ct.task_id AS "taskId",
         ct.property_id AS "propertyId",
         ct.task_title AS "taskTitle",
         ct.completed_at AS "completedAt",
         ct.notes,
         ct.actual_cost AS "actualCost",
         ct.created_at AS "createdAt"
       FROM completed_tasks AS ct
       INNER JOIN properties AS p
         ON p.id = ct.property_id
       WHERE ct.property_id = $1
         AND p.account_id = $2
       ORDER BY ct.completed_at DESC, ct.created_at DESC`,
      [propertyId, userId]
    );

    // An empty history is valid, but an inaccessible property is not.
    if (result.rowCount === 0) {
      const property = await pool.query(
        `SELECT id
         FROM properties
         WHERE id = $1 AND account_id = $2`,
        [propertyId, userId]
      );

      if (property.rowCount === 0) {
        return Response.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }
    }

    return Response.json({ history: result.rows });
  } catch (error) {
    console.error("Failed to fetch maintenance history:", error);

    return Response.json(
      { error: "Failed to fetch maintenance history" },
      { status: 500 }
    );
  }
}
