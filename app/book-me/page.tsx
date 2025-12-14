"use client";

import { useEffect, useState } from "react";

type Slot = { id: string; start_utc: string; end_utc: string };

export default function BookMePage() {
  const [tab, setTab] = useState<"fixed" | "request">("fixed");
  const [tz, setTz] = useState("UTC");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setTz(detected);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/slots", { cache: "no-store" });
      const data = await res.json();
      setSlots(data.slots || []);
      setLoading(false);
    })();
  }, []);

  const fmt = (isoUtc: string) =>
    new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoUtc));

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Book Me</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        Timezone: <b>{tz}</b> (auto-detected)
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button onClick={() => setTab("fixed")} style={btn(tab === "fixed")}>
          Pick a time
        </button>
        <button onClick={() => setTab("request")} style={btn(tab === "request")}>
          Request a time
        </button>
      </div>

      {tab === "fixed" ? (
        <FixedForm slots={slots} loading={loading} fmt={fmt} tz={tz} />
      ) : (
        <RequestForm tz={tz} />
      )}

      <div style={{ marginTop: 22, fontSize: 12, opacity: 0.75, lineHeight: 1.45 }}>
        This is a body-based coaching experience inspired by tantric principles. No sexual services are offered or implied.
      </div>
    </main>
  );
}

function FixedForm({ slots, loading, fmt, tz }: { slots: Slot[]; loading: boolean; fmt: (s: string) => string; tz: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [slotId, setSlotId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    setMsg(null);
    const res = await fetch("/api/book/fixed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, timezone: tz, slotId, notes }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Request received. You’ll get a confirmation by email." : data.error || "Error");
  };

  return (
    <section>
      <h2 style={{ fontSize: 18, marginBottom: 10 }}>Choose a fixed slot</h2>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {slots.map((s) => (
            <label key={s.id} style={card(slotId === s.id)}>
              <input type="radio" name="slot" checked={slotId === s.id} onChange={() => setSlotId(s.id)} />
              <div style={{ marginLeft: 10 }}>
                <div>
                  <b>{fmt(s.start_utc)}</b> → {fmt(s.end_utc)}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Displayed in your timezone</div>
              </div>
            </label>
          ))}
          {slots.length === 0 && <div>No slots available right now.</div>}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        <input style={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea style={{ ...input, minHeight: 90 }} placeholder="Notes / boundaries (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button style={{ ...cta, opacity: name && email && slotId ? 1 : 0.5 }} disabled={!name || !email || !slotId} onClick={submit}>
          Submit
        </button>
        {msg && <div>{msg}</div>}
      </div>
    </section>
  );
}

function RequestForm({ tz }: { tz: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [o1, setO1] = useState("");
  const [o2, setO2] = useState("");
  const [o3, setO3] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    setMsg(null);
    const res = await fetch("/api/book/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        timezone: tz,
        requestedOptions: [o1, o2, o3].filter(Boolean),
        notes,
      }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Request received. You’ll get a confirmation by email." : data.error || "Error");
  };

  return (
    <section>
      <h2 style={{ fontSize: 18, marginBottom: 10 }}>Request times</h2>
      <div style={{ display: "grid", gap: 10 }}>
        <input style={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={input} placeholder="Option 1 (e.g. Tue 6pm)" value={o1} onChange={(e) => setO1(e.target.value)} />
        <input style={input} placeholder="Option 2 (optional)" value={o2} onChange={(e) => setO2(e.target.value)} />
        <input style={input} placeholder="Option 3 (optional)" value={o3} onChange={(e) => setO3(e.target.value)} />
        <textarea style={{ ...input, minHeight: 90 }} placeholder="Notes / boundaries (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button style={{ ...cta, opacity: name && email && (o1 || o2 || o3) ? 1 : 0.5 }} disabled={!name || !email || (!o1 && !o2 && !o3)} onClick={submit}>
          Send request
        </button>
        {msg && <div>{msg}</div>}
      </div>
    </section>
  );
}

const input: React.CSSProperties = { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14 };
const cta: React.CSSProperties = { padding: "12px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer" };
const btn = (active: boolean): React.CSSProperties => ({ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: active ? "#111" : "#fff", color: active ? "#fff" : "#111", cursor: "pointer", flex: 1 });
const card = (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, border: `1px solid ${active ? "#111" : "#ddd"}`, cursor: "pointer" });
