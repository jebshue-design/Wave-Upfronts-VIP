"use client";

import { useState } from "react";

const S = {
  night:   "#0B0909",
  slate:   "#212922",
  volt:    "#E3F643",
  silver:  "#FAF7F4",
  clay:    "#94958B",
  line:    "#2E332E",
  fontMono: '"Space Grotesk", monospace',
};

type ViewerRow = { user: string; views: number; lastSeen: string };
type ShowData  = { title: string; viewers: ViewerRow[] };

export default function ShowViewerBreakdown({ shows, passwordToName }: { shows: ShowData[]; passwordToName: Record<string, string> }) {
  const [selected, setSelected] = useState<string>(shows[0]?.title ?? "");

  const show = shows.find((s) => s.title === selected);

  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, margin: 0 }}>
          Who Viewed Each Show
        </h2>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            background: S.slate,
            border: `1px solid ${S.line}`,
            borderRadius: "6px",
            color: S.silver,
            fontFamily: S.fontMono,
            fontSize: "12px",
            padding: "8px 12px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {shows.map((s) => (
            <option key={s.title} value={s.title}>{s.title}</option>
          ))}
        </select>
      </div>

      <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: S.slate }}>
              {["User / Password", "Views", "Last Viewed"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!show || show.viewers.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "24px 16px", color: S.clay, textAlign: "center", fontFamily: S.fontMono, fontSize: "12px" }}>
                  No views for this show yet
                </td>
              </tr>
            ) : show.viewers.map((v) => (
              <tr key={v.user} style={{ borderBottom: `1px solid ${S.line}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: S.volt }}>{passwordToName[v.user] ?? v.user}</td>
                <td style={{ padding: "12px 16px", color: S.silver, fontWeight: 600 }}>{v.views}</td>
                <td style={{ padding: "12px 16px", color: S.clay }}>{v.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
