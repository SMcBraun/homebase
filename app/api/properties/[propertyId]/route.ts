// Property Management API (issue #2)
// GET    /api/properties/[propertyId] -> show one property
// PATCH  /api/properties/[propertyId] -> edit a property
// DELETE /api/properties/[propertyId] -> remove a property (its tasks are removed too)

import { headers } from "next/headers";
import pool from "@/lib/db";
import { auth } from "@/lib/auth";

// Columns sent back to the browser, matching the Property type in lib/types.ts
const PROPERTY_COLUMNS = `
  id,
  account_id AS "accountId",
  name,
  location,
  notes,
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

// Property ids are UUIDs. Checking the shape first means a bad id gets a
// friendly 404 instead of a database error.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Who is signed in? Returns their user id, or null if nobody is signed in.
// Note: can switch to the shared getCurrentUserId() helper once PR #13 is merged.
async function getSignedInUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

// GET: show one property, only if it belongs to the signed-in user
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]">
) {
  try {
    const userId = await getSignedInUserId();

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
      `SELECT ${PROPERTY_COLUMNS}
      FROM properties
      WHERE id = $1 AND account_id = $2`,
      [propertyId, userId]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return Response.json({ property: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch property:", error);

    return Response.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

// PATCH: edit only the fields that were sent (name, location, and/or notes)
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]">
) {
  try {
    const userId = await getSignedInUserId();

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
    const allowedFields = ["name", "location", "notes"];

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

    // Build the update one field at a time. Only fixed column names go into
    // the SQL text; the user's values always go in as $1, $2... placeholders.
    const setClauses: string[] = [];
    const values: unknown[] = [];

    if ("name" in data) {
      if (typeof data.name !== "string" || !data.name.trim()) {
        return Response.json(
          { error: "Property name cannot be empty" },
          { status: 400 }
        );
      }

      const name = data.name.trim();

      if (name.length > 150) {
        return Response.json(
          { error: "Property name must be 150 characters or less" },
          { status: 400 }
        );
      }

      values.push(name);
      setClauses.push(`name = $${values.length}`);
    }

    if ("location" in data) {
      if (typeof data.location !== "string" || !data.location.trim()) {
        return Response.json(
          { error: "Property location cannot be empty" },
          { status: 400 }
        );
      }

      values.push(data.location.trim());
      setClauses.push(`location = $${values.length}`);
    }

    if ("notes" in data) {
      if (data.notes !== null && typeof data.notes !== "string") {
        return Response.json({ error: "Invalid notes" }, { status: 400 });
      }

      const notes =
        typeof data.notes === "string" ? data.notes.trim() || null : null;

      values.push(notes);
      setClauses.push(`notes = $${values.length}`);
    }

    values.push(propertyId);
    const idParam = values.length;

    values.push(userId);
    const userParam = values.length;

    const result = await pool.query(
      `UPDATE properties
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idParam} AND account_id = $${userParam}
      RETURNING ${PROPERTY_COLUMNS}`,
      values
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return Response.json({ property: result.rows[0] });
  } catch (error) {
    console.error("Failed to update property:", error);

    return Response.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// DELETE: remove a property. The database also removes its tasks and
// completion records (ON DELETE CASCADE in database/schema.sql).
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/properties/[propertyId]">
) {
  try {
    const userId = await getSignedInUserId();

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
      `DELETE FROM properties
      WHERE id = $1 AND account_id = $2
      RETURNING id`,
      [propertyId, userId]
    );

    if (result.rowCount === 0) {
      return Response.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return Response.json({ deleted: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Failed to delete property:", error);

    return Response.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
