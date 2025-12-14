import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, timezone, slotId, notes } = await req.json();
    if (!name || !email || !timezone || !slotId) {
      return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO bookings (id, type, name, email, timezone, fixed_slot_id, notes, status, created_at_utc)
            VALUES (?, 'fixed', ?, ?, ?, ?, ?, 'pending', ?)`,
      args: [id, name, email, timezone, slotId, notes || "", createdAt],
    });

    return Response.json({ ok: true, id });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
