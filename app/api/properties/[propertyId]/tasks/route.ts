
import pool from "@/lib/db";
import { getCurrentUserId } from "@/lib/get-current-user";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]/tasks">
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId } = await ctx.params;

    const property = await pool.query(
      "SELECT id FROM properties WHERE id = $1 AND account_id = $2",
      [propertyId, userId]
    );

    if (property.rowCount === 0) {
      return Response.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `SELECT
        id,
        property_id AS "propertyId",
        title,
        description,
        category,
        TO_CHAR(due_date, 'YYYY-MM-DD') AS "dueDate",
        estimated_cost AS "estimatedCost",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tasks
      WHERE property_id = $1
      ORDER BY due_date ASC`,
      [propertyId]
    );

    return Response.json({ tasks: result.rows });
  } catch (error) {
    console.error("Failed to fetch maintenance tasks:", error);

    return Response.json(
      { error: "Failed to fetch maintenance tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]/tasks">
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId } = await ctx.params;

    const property = await pool.query(
      "SELECT id FROM properties WHERE id = $1 AND account_id = $2",
      [propertyId, userId]
    );

    if (property.rowCount === 0) {
      return Response.json(
        { error: "Property not found" },
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

    const allowedFields = [
      "title",
      "description",
      "category",
      "dueDate",
      "estimatedCost",
    ];

    if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
      return Response.json(
        { error: "Unknown field provided" },
        { status: 400 }
      );
    }

    if (typeof data.title !== "string" || !data.title.trim()) {
      return Response.json(
        { error: "A valid task title is required" },
        { status: 400 }
      );
    }

    const title = data.title.trim();

    for (const field of ["description", "category"] as const) {
      if (
        field in data &&
        data[field] !== null &&
        typeof data[field] !== "string"
      ) {
        return Response.json(
          { error: `Invalid ${field}` },
          { status: 400 }
        );
      }
    }

    const description =
      typeof data.description === "string"
        ? data.description.trim() || null
        : null;

    const category =
      typeof data.category === "string"
        ? data.category.trim() || null
        : null;

    const dueDate =
      typeof data.dueDate === "string" ? data.dueDate : "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return Response.json(
        { error: "A valid due date is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(`${dueDate}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== dueDate
    ) {
      return Response.json(
        { error: "Invalid due date" },
        { status: 400 }
      );
    }

    let estimatedCost: number | null = null;

    if (
      "estimatedCost" in data &&
      data.estimatedCost !== null &&
      data.estimatedCost !== ""
    ) {
      if (
        typeof data.estimatedCost !== "number" ||
        !Number.isFinite(data.estimatedCost) ||
        data.estimatedCost < 0
      ) {
        return Response.json(
          { error: "Estimated cost must be a non-negative number" },
          { status: 400 }
        );
      }

      estimatedCost = data.estimatedCost;
    }

    const result = await pool.query(
      `INSERT INTO tasks (
        property_id,
        title,
        description,
        category,
        due_date,
        estimated_cost
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        property_id AS "propertyId",
        title,
        description,
        category,
        due_date AS "dueDate",
        estimated_cost AS "estimatedCost",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"`,
      [
        propertyId,
        title,
        description,
        category,
        dueDate,
        estimatedCost,
      ]
    );

    return Response.json(
      { task: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create maintenance task:", error);

    return Response.json(
      { error: "Failed to create maintenance task" },
      { status: 500 }
    );
  }
}
