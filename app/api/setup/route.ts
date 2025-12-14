import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS slots (
        id TEXT PRIMARY KEY,
        start_utc TEXT NOT NULL,
        end_utc   TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        timezone TEXT NOT NULL,
        fixed_slot_id TEXT,
        requested_options_json TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at_utc TEXT NOT NULL
      );
    `);

    await db.execute(`
      INSERT OR IGNORE INTO slots (id, start_utc, end_utc, is_active)
      VALUES
      ('slot-001', '2025-12-15T22:00:00.000Z', '2025-12-15T23:00:00.000Z', 1),
      ('slot-002', '2025-12-16T00:00:00.000Z', '2025-12-16T01:00:00.000Z', 1),
      ('slot-003', '2025-12-16T02:00:00.000Z', '2025-12-16T03:00:00.000Z', 1);
    `);

    return new Response(
      JSON.stringify({ ok: true, message: "DB initialized + slots created" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
}
