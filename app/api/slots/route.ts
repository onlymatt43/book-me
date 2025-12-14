import { db } from "@/lib/db";

export async function GET() {
  const rs = await db.execute(
    `SELECT id, start_utc, end_utc FROM slots WHERE is_active = 1 ORDER BY start_utc ASC`
  );

  const slots = rs.rows.map((r: any) => ({
    id: r.id,
    start_utc: r.start_utc,
    end_utc: r.end_utc,
  }));

  return Response.json({ slots });
}
