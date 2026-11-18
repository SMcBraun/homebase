import pool from "../lib/db";

async function testConnection() {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('session', 'account', 'verification')
      ORDER BY table_name;
    `);

    console.log("Database connected successfully!");
    console.log("Better Auth tables found:");

    for (const row of result.rows) {
      console.log(`- ${row.table_name}`);
    }

    if (result.rows.length !== 3) {
      console.log("Some Better Auth tables are missing.");
    } else {
      console.log("All three Better Auth tables are available!");
    }
  } catch (error) {
    console.error("Database check failed:", error);
  } finally {
    await pool.end();
  }
}

testConnection();