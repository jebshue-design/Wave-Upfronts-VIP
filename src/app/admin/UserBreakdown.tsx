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

type ShowRow = { title: string; views: number; youtubeClicks: number; spotifyClicks: number; sizzleClicks: number; onesheetClicks: number; lastSeen: string };
type UserData = { user: string; totalViews: number; firstSeen: string; lastSeen: string; shows: ShowRow[] };

export default function UserBreakdown({ users, passwordToName }: { users: UserData[]; passwordToName: Record<string, string> }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>(users[0]?.user ?? "");

  const displayName = (u: UserData) => passwordToName[u.user] ?? u.user;

  const filtered = search.trim()
    ? users.filter((u) => displayName(u).toLowerCase().includes(search.toLowerCase()))
    : users;

  const user = users.find((u) => u.user === selected);

  const selectedName = selected ? (passwordToName[selected] ?? selected) : "";

  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, margin: "0 0 12px" }}>
          Per-User Breakdown
        </h2>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "180px", maxWidth: "280px" }}>
            <input
              type="text"
              placeholder="Filter by name or company…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (filtered.length > 0 && !filtered.find((u) => u.user === selected)) {
                  setSelected(filtered[0]?.user ?? "");
                }
              }}
              style={{
                background: S.slate,
                border: `1px solid ${S.line}`,
                borderRadius: "6px",
                color: S.silver,
                fontFamily: S.fontMono,
                fontSize: "12px",
                padding: "8px 12px 8px 32px",
                width: "100%",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: S.clay, fontSize: "12px", pointerEvents: "none" }}>⌕</span>
          </div>

          {/* Dropdown */}
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
              minWidth: "200px",
            }}
          >
            {filtered.length === 0 ? (
              <option disabled>No matches</option>
            ) : filtered.map((u) => (
              <option key={u.user} value={u.user}>{displayName(u)}</option>
            ))}
          </select>

          {/* Stats for selected user */}
          {user && (
            <div style={{ display: "flex", gap: "24px", marginLeft: "auto", flexWrap: "wrap" }}>
              {[
                { label: "Total Show Views", value: user.totalViews },
                { label: "First Seen",       value: user.firstSeen },
                { label: "Last Seen",        value: user.lastSeen },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay }}>{label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: S.silver }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected user name display */}
        {selectedName && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: S.clay }}>
            Showing: <span style={{ color: S.volt, fontWeight: 600 }}>{selectedName}</span>
          </div>
        )}
      </div>

      <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: S.slate }}>
              {["Show", "Views", "YouTube", "Spotify", "Sizzle", "One-Sheet", "Last Viewed"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!user || user.shows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "24px 16px", color: S.clay, textAlign: "center", fontFamily: S.fontMono, fontSize: "12px" }}>
                  No activity for this user yet
                </td>
              </tr>
            ) : user.shows.map((s) => (
              <tr key={s.title} style={{ borderBottom: `1px solid ${S.line}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: S.silver }}>{s.title}</td>
                <td style={{ padding: "12px 16px", color: S.volt, fontWeight: 700 }}>{s.views}</td>
                <td style={{ padding: "12px 16px", color: s.youtubeClicks > 0 ? S.silver : S.line }}>{s.youtubeClicks || "—"}</td>
                <td style={{ padding: "12px 16px", color: s.spotifyClicks > 0 ? S.silver : S.line }}>{s.spotifyClicks || "—"}</td>
                <td style={{ padding: "12px 16px", color: s.sizzleClicks > 0 ? S.silver : S.line }}>{s.sizzleClicks || "—"}</td>
                <td style={{ padding: "12px 16px", color: s.onesheetClicks > 0 ? S.silver : S.line }}>{s.onesheetClicks || "—"}</td>
                <td style={{ padding: "12px 16px", color: S.clay }}>{s.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
