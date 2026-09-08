"use client";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  line: "#2E332E",
  lineStrong: "#3F4640",
  fontMono: '"Space Grotesk", monospace',
  pill: "999px",
};

const EMAIL_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ae_outreach:       { label: "AE Outreach",    color: S.volt,      bg: "rgba(227,246,67,0.1)" },
  ae_followup:       { label: "AE Follow-up",   color: "#FF8C00",   bg: "rgba(255,140,0,0.1)" },
  ae_onesheet:       { label: "One-Sheet",       color: "#0AC2FF",   bg: "rgba(10,194,255,0.1)" },
  ae_custom:         { label: "Custom",          color: S.clay,      bg: "rgba(148,149,139,0.1)" },
  rsvp_confirmation: { label: "RSVP Confirm",   color: "#0BDD65",   bg: "rgba(11,221,101,0.1)" },
  reminder_30d:      { label: "30-Day Reminder", color: S.clay,     bg: "rgba(148,149,139,0.1)" },
  reminder_14d:      { label: "14-Day Reminder", color: S.clay,     bg: "rgba(148,149,139,0.1)" },
  reminder_7d:       { label: "7-Day Reminder",  color: "#FF8C00",  bg: "rgba(255,140,0,0.1)" },
  reminder_2d:       { label: "2-Day Reminder",  color: "#FF8C00",  bg: "rgba(255,140,0,0.1)" },
  day_of:            { label: "Day-of",          color: S.volt,     bg: "rgba(227,246,67,0.1)" },
};

type EmailLogEntry = {
  id: string;
  recipient_email: string;
  recipient_name: string;
  type: string;
  sent_by: string;
  notes?: string;
  created_at: string;
};

export default function EmailLogTab({ emailLog }: { emailLog: EmailLogEntry[] }) {
  const total = emailLog.length;
  const byType: Record<string, number> = {};
  for (const e of emailLog) byType[e.type] = (byType[e.type] ?? 0) + 1;

  const cell: React.CSSProperties = { padding: "12px 16px", borderBottom: `1px solid ${S.line}`, fontSize: "13px", color: S.silver, verticalAlign: "middle" };
  const headCell: React.CSSProperties = { ...cell, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, background: S.slate };

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <div style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "10px", padding: "18px 24px", minWidth: "120px" }}>
          <div style={{ fontFamily: S.fontMono, fontSize: "32px", fontWeight: 700, color: S.volt, lineHeight: 1 }}>{total}</div>
          <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginTop: "6px" }}>Total Logged</div>
        </div>
        {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
          const cfg = EMAIL_TYPE_CONFIG[type] ?? { label: type, color: S.clay, bg: "transparent" };
          return (
            <div key={type} style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: "10px", padding: "18px 24px", minWidth: "100px" }}>
              <div style={{ fontFamily: S.fontMono, fontSize: "28px", fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color, opacity: 0.8, marginTop: "6px" }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {emailLog.length === 0 ? (
        <div style={{ fontFamily: S.fontMono, fontSize: "13px", color: S.lineStrong, padding: "40px", textAlign: "center", border: `1px solid ${S.line}`, borderRadius: "10px" }}>
          No emails logged yet. Use the Pipeline tab to log AE outreach.
        </div>
      ) : (
        <div style={{ border: `1px solid ${S.line}`, borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Date", "Recipient", "Type", "Sent By", "Notes"].map((h) => (
                  <th key={h} style={headCell as React.CSSProperties}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emailLog.map((e) => {
                const cfg = EMAIL_TYPE_CONFIG[e.type] ?? { label: e.type, color: S.clay, bg: "transparent" };
                return (
                  <tr key={e.id}>
                    <td style={{ ...cell, fontFamily: S.fontMono, fontSize: "11px", color: S.clay, whiteSpace: "nowrap" }}>
                      {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <div style={{ fontSize: "10px", color: S.lineStrong }}>
                        {new Date(e.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </td>
                    <td style={cell}>
                      <div style={{ fontWeight: 600 }}>{e.recipient_name}</div>
                      <div style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.clay }}>{e.recipient_email}</div>
                    </td>
                    <td style={cell}>
                      <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: S.pill, padding: "3px 10px" }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ ...cell, fontFamily: S.fontMono, fontSize: "11px", color: S.silver }}>{e.sent_by}</td>
                    <td style={{ ...cell, color: S.clay, fontSize: "12px" }}>{e.notes ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
