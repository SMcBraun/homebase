// Property Management API (issue #2)
// GET  /api/properties -> list the signed-in user's properties
// POST /api/properties -> add a new property for the signed-in user

import { headers } from "next/headers";
import pool from "@/lib/db";
import { auth } from "@/lib/auth";

// Columns sent back to the browser. Renamed from database style (account_id)
// to code style (accountId) so they match the Property type in lib/types.ts.
const PROPERTY_COLUMNS = `
  id,
  account_id AS "accountId",
  name,
  location,
  notes,
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

// Who is signed in? Returns their user id, or null if nobody is signed in.
// Note: can switch to the shared getCurrentUserId() helper once PR #13 is merged.
async function getSignedInUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

// GET: list only the signed-in user's properties, sorted A to Z by name
export async function GET() {
  try {
    const userId = await getSignedInUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT ${PROPERTY_COLUMNS}
      FROM properties
      WHERE account_id = $1
      ORDER BY name ASC`,
      [userId]
    );

    return Response.json({ properties: result.rows });
  } catch (error) {
    console.error("Failed to fetch properties:", error);

    return Response.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// POST: add a new property owned by the signed-in user
export async function POST(request: Request) {
  try {
    const userId = await getSignedInUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the JSON body sent by the form
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

    // Only these fields are allowed (accountId comes from the sign-in, never the form)
    const allowedFields = ["name", "location", "notes"];

    if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
      return Response.json(
        { error: "Unknown field provided" },
        { status: 400 }
      );
    }

    // Name is required, max 150 characters (matches the database column)
    if (typeof data.name !== "string" || !data.name.trim()) {
      return Response.json(
        { error: "A property name is required" },
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

    // Location is required
    if (typeof data.location !== "string" || !data.location.trim()) {
      return Response.json(
        { error: "A property location is required" },
        { status: 400 }
      );
    }

    const location = data.location.trim();

    // Notes are optional: text or null
    if (
      "notes" in data &&
      data.notes !== null &&
      typeof data.notes !== "string"
    ) {
      return Response.json({ error: "Invalid notes" }, { status: 400 });
    }

    const notes =
      typeof data.notes === "string" ? data.notes.trim() || null : null;

    const result = await pool.query(
      `INSERT INTO properties (account_id, name, location, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING ${PROPERTY_COLUMNS}`,
      [userId, name, location, notes]
    );

    return Response.json(
      { property: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create property:", error);

    return Response.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
