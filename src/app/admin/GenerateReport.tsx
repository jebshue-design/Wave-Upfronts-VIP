"use client";

import { useState } from "react";

const S = {
  night:       "#0B0909",
  slate:       "#212922",
  volt:        "#E3F643",
  silver:      "#FAF7F4",
  clay:        "#94958B",
  line:        "#2E332E",
  pill:        "999px",
  fontMono:    '"Space Grotesk", monospace',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
};

type Props = {
  stats: { label: string; value: number | string }[];
  sortedShows: [string, number][];
  userBreakdownData: {
    user: string; totalViews: number; firstSeen: string; lastSeen: string;
    shows: { title: string; views: number; youtubeClicks: number; spotifyClicks: number; sizzleClicks: number; onesheetClicks: number; lastSeen: string }[];
  }[];
  rsvps: { name: string; email: string; company: string; title: string; created_at: string }[] | null;
  logins: { created_at: string; password_used?: string; ip?: string }[];
  vipAccounts: { name: string; email: string; company: string; title: string; password: string; created_at: string }[];
};

const SECTIONS = [
  { key: "stats",       label: "Summary Stats" },
  { key: "topShows",    label: "Top Shows Ranking" },
  { key: "engagement",  label: "User Engagement" },
  { key: "rsvps",       label: "RSVPs" },
  { key: "vipAccounts", label: "VIP Account List" },
  { key: "logins",      label: "Login Log" },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GenerateReport({ stats, sortedShows, userBreakdownData, rsvps, logins, vipAccounts }: Props) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Record<SectionKey, boolean>>({
    stats: true, topShows: true, engagement: true, rsvps: true, vipAccounts: true, logins: true,
  });

  const toggle = (key: SectionKey) => setSel((s) => ({ ...s, [key]: !s[key] }));
  const noneSelected = !Object.values(sel).some(Boolean);

  const handleCSV = () => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const rows: string[][] = [
      ["Wave Upfronts 2026 — Engagement Report"],
      [`Generated: ${today}`],
      [],
    ];

    if (sel.stats) {
      rows.push(["SUMMARY"], ...stats.map(({ label, value }) => [label, String(value)]), []);
    }
    if (sel.topShows) {
      rows.push(["TOP SHOWS BY VIEWS"], ["Rank", "Show", "Views"],
        ...sortedShows.map(([show, count], i) => [String(i + 1), show, String(count)]), []);
    }
    if (sel.engagement) {
      rows.push(
        ["USER SHOW ENGAGEMENT"],
        ["User", "Show", "Views", "YouTube Clicks", "Spotify Clicks", "Sizzle Plays", "One-Sheet Downloads", "Last Viewed"],
        ...userBreakdownData.flatMap((u) =>
          u.shows.map((s) => [u.user, s.title, String(s.views), String(s.youtubeClicks), String(s.spotifyClicks), String(s.sizzleClicks), String(s.onesheetClicks), s.lastSeen])
        ), []
      );
    }
    if (sel.rsvps) {
      rows.push(["RSVPs"], ["Name", "Email", "Company", "Title", "Submitted"],
        ...(rsvps ?? []).map((r) => [r.name, r.email, r.company, r.title, new Date(r.created_at).toLocaleString()]), []);
    }
    if (sel.vipAccounts) {
      rows.push(["VIP ACCOUNTS"], ["Name", "Title", "Email", "Company", "Password", "Created"],
        ...vipAccounts.map((a) => [a.name, a.title, a.email, a.company, a.password, new Date(a.created_at).toLocaleDateString()]), []);
    }
    if (sel.logins) {
      rows.push(["LOGIN LOG"], ["Time", "Password Used", "IP Address"],
        ...logins.map((l) => [new Date(l.created_at).toLocaleString(), l.password_used ?? "", l.ip ?? ""]));
    }

    downloadCSV(`wave-upfronts-report-${today.replace(/,?\s/g, "-")}.csv`, rows);
    setOpen(false);
  };

  const handlePrint = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const userRows = sel.engagement ? userBreakdownData.map((u) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#111">${u.user}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">
          ${u.shows.map((s) => `<span style="display:inline-block;background:#f3f4f6;border-radius:4px;padding:2px 8px;margin:2px;font-size:11px">${s.title}${s.views > 1 ? ` ×${s.views}` : ""}</span>`).join("")}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700">${u.totalViews}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${u.lastSeen}</td>
      </tr>`).join("") : "";

    const showRows = sel.topShows ? sortedShows.map(([show, count], i) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:${i === 0 ? "#111" : "#374151"};text-align:center">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${show}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${i === 0 ? "#111" : "#374151"}">${count}</td>
      </tr>`).join("") : "";

    const rsvpRows = sel.rsvps ? (rsvps ?? []).map((r) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${r.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151">${r.email}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151">${r.company}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151">${r.title}</td>
      </tr>`).join("") : "";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wave Upfronts 2026 — Engagement Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111; background: #fff; padding: 48px; font-size: 13px; line-height: 1.5; }
    @media print { body { padding: 24px; } .no-print { display: none; } }
    .header { border-bottom: 3px solid #111; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-top: 8px; }
    .date { font-size: 12px; color: #6b7280; text-align: right; }
    .stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 40px; }
    .stat { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 800; }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-top: 4px; }
    h2 { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; margin-top: 36px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    thead tr { background: #f9fafb; }
    th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    .confidential { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; letter-spacing: 0.06em; text-transform: uppercase; }
    .print-btn { position: fixed; top: 24px; right: 24px; background: #111; color: #fff; border: none; border-radius: 999px; padding: 12px 24px; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print / Save PDF</button>
  <div class="header">
    <div>
      <div class="logo">Wave Sports &amp; Entertainment</div>
      <h1>Upfronts 2026<br>Engagement Report</h1>
    </div>
    <div class="date">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280">Generated</div>
      <div style="font-size:15px;font-weight:700;margin-top:4px">${today}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px">Confidential · VIP Only</div>
    </div>
  </div>

  ${sel.stats ? `<div class="stats">${stats.map(({ label, value }) => `<div class="stat"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`).join("")}</div>` : ""}

  ${sel.topShows && sortedShows.length > 0 ? `
  <h2>Top Shows by Views</h2>
  <table>
    <thead><tr><th style="width:40px">#</th><th>Show</th><th style="width:80px;text-align:center">Views</th></tr></thead>
    <tbody>${showRows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#9ca3af">No views yet</td></tr>'}</tbody>
  </table>` : ""}

  ${sel.engagement ? `
  <h2>User Show Engagement</h2>
  <table>
    <thead><tr><th>User</th><th>Shows Viewed</th><th style="width:80px;text-align:center">Total Views</th><th style="width:160px">Last Seen</th></tr></thead>
    <tbody>${userRows || '<tr><td colspan="4" style="padding:16px;text-align:center;color:#9ca3af">No activity yet</td></tr>'}</tbody>
  </table>` : ""}

  ${sel.rsvps && rsvps && rsvps.length > 0 ? `
  <h2>RSVPs (${rsvps.length})</h2>
  <table>
    <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Title</th></tr></thead>
    <tbody>${rsvpRows}</tbody>
  </table>` : ""}

  ${sel.vipAccounts && vipAccounts.length > 0 ? `
  <h2>VIP Accounts (${vipAccounts.length})</h2>
  <table>
    <thead><tr><th>Name</th><th>Title</th><th>Email</th><th>Company</th><th>Password</th></tr></thead>
    <tbody>${vipAccounts.map((a) => `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${a.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151">${a.title}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151">${a.email}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151">${a.company}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;color:#374151">${a.password}</td>
    </tr>`).join("")}</tbody>
  </table>` : ""}

  <div class="confidential">Confidential · Wave Sports &amp; Entertainment · Upfronts 2026 · Internal Use Only</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
    setOpen(false);
  };

  const btnBase: React.CSSProperties = {
    border: "none",
    borderRadius: S.pill,
    fontFamily: S.fontMono,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "12px 24px",
    cursor: "pointer",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ ...btnBase, background: S.volt, color: S.night }}
      >
        Export Report ▾
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />

          {/* panel */}
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 50,
            background: S.slate,
            border: `1px solid ${S.line}`,
            borderRadius: "10px",
            padding: "20px",
            width: "260px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "14px" }}>
              Include in Export
            </div>

            {SECTIONS.map(({ key, label }) => (
              <label
                key={key}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", cursor: "pointer", borderBottom: `1px solid ${S.line}` }}
              >
                <input
                  type="checkbox"
                  checked={sel[key]}
                  onChange={() => toggle(key)}
                  style={{ accentColor: S.volt, width: "15px", height: "15px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", color: sel[key] ? S.silver : S.clay, fontFamily: S.fontMono }}>{label}</span>
              </label>
            ))}

            {noneSelected && (
              <div style={{ fontSize: "11px", color: "#ff6b6b", marginTop: "10px" }}>Select at least one section.</div>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                onClick={handlePrint}
                disabled={noneSelected}
                style={{ ...btnBase, flex: 1, padding: "10px 12px", background: S.volt, color: S.night, opacity: noneSelected ? 0.4 : 1, cursor: noneSelected ? "not-allowed" : "pointer" }}
              >
                Print / PDF
              </button>
              <button
                onClick={handleCSV}
                disabled={noneSelected}
                style={{ ...btnBase, flex: 1, padding: "10px 12px", background: "transparent", color: S.volt, border: `1px solid ${S.volt}`, opacity: noneSelected ? 0.4 : 1, cursor: noneSelected ? "not-allowed" : "pointer" }}
              >
                CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
