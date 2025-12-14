import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, timezone, requestedOptions, notes } = await req.json();
    if (!name || !email || !timezone || !Array.isArray(requestedOptions) || requestedOptions.length === 0) {
      return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO bookings (id, type, name, email, timezone, requested_options_json, notes, status, created_at_utc)
            VALUES (?, 'request', ?, ?, ?, ?, ?, 'pending', ?)`,
      args: [id, name, email, timezone, JSON.stringify(requestedOptions), notes || "", createdAt],
    });

    return Response.json({ ok: true, id });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
