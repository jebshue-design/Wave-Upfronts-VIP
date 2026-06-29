import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function AdminPage() {
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const logins = events?.filter((e) => e.type === "login") ?? [];
  const clicks = events?.filter((e) => e.type !== "login") ?? [];

  const S = {
    night: "#0B0909",
    slate: "#212922",
    volt: "#E3F643",
    silver: "#FAF7F4",
    clay: "#94958B",
    line: "#2E332E",
    fontMono: '"Space Grotesk", monospace',
    fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
  };

  return (
    <div style={{ background: S.night, minHeight: "100vh", color: S.silver, padding: "48px 40px", fontFamily: S.fontMono }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "10px" }}>
            Wave Upfronts 2026
          </div>
          <h1 style={{ fontFamily: S.fontDisplay, fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            Site Activity
          </h1>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "48px" }}>
          {[
            { label: "Total Logins", value: logins.length },
            { label: "Unique Passwords", value: new Set(logins.map((e) => e.password_used)).size },
            { label: "Click Events", value: clicks.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: S.slate, padding: "24px", borderRadius: "8px" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: S.volt, marginBottom: "6px" }}>{value}</div>
              <div style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Logins table */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginBottom: "16px" }}>
            Login Events
          </h2>
          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: S.slate }}>
                  {["Time", "Password Used", "IP Address", "Browser"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logins.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "24px 16px", color: S.clay, textAlign: "center" }}>No logins yet</td></tr>
                ) : logins.map((e, i) => (
                  <tr key={e.id ?? i} style={{ borderBottom: `1px solid ${S.line}` }}>
                    <td style={{ padding: "12px 16px", color: S.silver }}>{new Date(e.created_at).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ background: S.volt, color: S.night, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>{e.password_used}</span></td>
                    <td style={{ padding: "12px 16px", color: S.clay }}>{e.ip}</td>
                    <td style={{ padding: "12px 16px", color: S.clay, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.user_agent?.split(" ")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Click events table */}
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginBottom: "16px" }}>
            Click Events
          </h2>
          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: S.slate }}>
                  {["Time", "Event", "Details"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clicks.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: "24px 16px", color: S.clay, textAlign: "center" }}>No click events yet</td></tr>
                ) : clicks.map((e, i) => (
                  <tr key={e.id ?? i} style={{ borderBottom: `1px solid ${S.line}` }}>
                    <td style={{ padding: "12px 16px", color: S.silver }}>{new Date(e.created_at).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", color: S.volt }}>{e.type}</td>
                    <td style={{ padding: "12px 16px", color: S.clay }}>{e.metadata ? JSON.stringify(e.metadata) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
