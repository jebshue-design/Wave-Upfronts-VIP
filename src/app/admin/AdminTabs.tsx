"use client";

import { useState } from "react";
import ShowViewerBreakdown from "./ShowViewerBreakdown";
import UserBreakdown from "./UserBreakdown";
import GenerateReport from "./GenerateReport";
import VipAccountManager from "./VipAccountManager";
import VipInfoTab from "./VipInfoTab";

const S = {
  night:       "#0B0909",
  slate:       "#212922",
  volt:        "#E3F643",
  silver:      "#FAF7F4",
  clay:        "#94958B",
  line:        "#2E332E",
  lineStrong:  "#3F4640",
  fontMono:    '"Space Grotesk", monospace',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
};

const cell: React.CSSProperties = { padding: "12px 16px", borderBottom: `1px solid ${S.line}` };
const headCell: React.CSSProperties = { ...cell, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, background: S.slate };

type Props = {
  stats: { label: string; value: number | string }[];
  sortedShows: [string, number][];
  maxViews: number;
  showViewerData: { title: string; viewers: { user: string; views: number; lastSeen: string }[] }[];
  userBreakdownData: {
    user: string; totalViews: number; firstSeen: string; lastSeen: string;
    shows: { title: string; views: number; youtubeClicks: number; spotifyClicks: number; sizzleClicks: number; onesheetClicks: number; lastSeen: string }[];
  }[];
  userShowMap: Record<string, Record<string, number>>;
  logins: { id?: string; created_at: string; password_used?: string; ip?: string; user_agent?: string }[];
  rsvps: { id?: string; created_at: string; name: string; email: string; company: string; title: string }[] | null;
  events: { id?: string; created_at: string; type: string; password_used?: string; metadata?: Record<string, string> }[];
  vipAccounts: { id?: string; name: string; email: string; company: string; title: string; password: string; created_at: string; point_of_contact?: string; past_deals?: string; notes?: string; client_status?: string }[];
  passwordToName: Record<string, string>;
  engagementByUser: Record<string, {
    topViewedShow:  { title: string; views: number }  | null;
    topClickedShow: { title: string; clicks: number } | null;
    topTimeShow:    { title: string; seconds: number } | null;
    totalShowsViewed: number;
    totalClicks: number;
    totalTimeSeconds: number;
  }>;
};

const TABS = ["Overview", "Shows", "Users", "RSVPs", "Accounts", "VIP Info", "Logins"] as const;
type Tab = typeof TABS[number];

export default function AdminTabs(props: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const { stats, sortedShows, maxViews, showViewerData, userBreakdownData, userShowMap, logins, rsvps, events, vipAccounts, passwordToName, engagementByUser } = props;

  const showEngagement = selectedShow
    ? userBreakdownData
        .map((u) => {
          const s = u.shows.find((s) => s.title === selectedShow);
          if (!s) return null;
          const totalClicks = s.youtubeClicks + s.spotifyClicks + s.sizzleClicks + s.onesheetClicks;
          return { displayName: passwordToName[u.user] ?? u.user, views: s.views, youtubeClicks: s.youtubeClicks, spotifyClicks: s.spotifyClicks, sizzleClicks: s.sizzleClicks, onesheetClicks: s.onesheetClicks, totalClicks };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => b.totalClicks - a.totalClicks || b.views - a.views)
    : [];

  return (
    <>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "32px", borderBottom: `1px solid ${S.line}`, paddingBottom: "0", alignItems: "flex-end" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? `2px solid ${S.volt}` : "2px solid transparent",
              color: activeTab === tab ? S.silver : S.clay,
              fontFamily: S.fontMono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "12px 20px",
              cursor: "pointer",
              marginBottom: "-1px",
              transition: "color 0.15s ease",
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ marginLeft: "auto", paddingBottom: "8px" }}>
          <GenerateReport
            stats={stats}
            sortedShows={sortedShows}
            userBreakdownData={userBreakdownData}
            rsvps={rsvps}
            logins={logins}
            vipAccounts={vipAccounts}
          />
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "Overview" && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "40px" }}>
            {stats.map(({ label, value }) => (
              <div key={label} style={{ background: S.slate, padding: "24px", borderRadius: "8px" }}>
                <div style={{ fontSize: "32px", fontWeight: 700, color: S.volt, marginBottom: "6px" }}>{value}</div>
                <div style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Top shows ranking */}
          {sortedShows.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginBottom: "16px" }}>Top Shows</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {sortedShows.map(([show, count], i) => (
                  <div
                    key={show}
                    onClick={() => setSelectedShow(show)}
                    style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "8px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = S.volt)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = S.line)}
                  >
                    <div style={{ fontFamily: S.fontDisplay, fontSize: "22px", fontWeight: 700, color: i === 0 ? S.volt : S.lineStrong, width: "36px", flexShrink: 0, textAlign: "center" }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: "15px", fontWeight: 600, color: S.silver }}>{show}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: `${Math.max((count / maxViews) * 120, 8)}px`, height: "6px", background: i === 0 ? S.volt : S.lineStrong, borderRadius: "3px" }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: i === 0 ? S.volt : S.silver, minWidth: "24px", textAlign: "right" }}>{count}</span>
                      <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay }}>{count === 1 ? "view" : "views"}</span>
                    </div>
                    <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay }}>Details →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-user summary */}
          <div>
            <h2 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginBottom: "16px" }}>User Activity Summary</h2>
            <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr>{["User / Password", "Shows Viewed", "Total Views", "Last Seen"].map((h) => <th key={h} style={headCell as React.CSSProperties}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {Object.keys(userShowMap).length === 0 ? (
                    <tr><td colSpan={4} style={{ ...cell, color: S.clay, textAlign: "center" }}>No show views yet</td></tr>
                  ) : Object.entries(userShowMap)
                      .sort((a, b) => Object.values(b[1]).reduce((s, n) => s + n, 0) - Object.values(a[1]).reduce((s, n) => s + n, 0))
                      .map(([user, showCounts]) => {
                        const totalViews = Object.values(showCounts).reduce((s, n) => s + n, 0);
                        const lastSeen = events.filter((e) => e.password_used === user).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at;
                        const displayName = passwordToName[user] ?? user;
                        return (
                          <tr key={user} style={{ borderBottom: `1px solid ${S.line}` }}>
                            <td style={{ ...cell, fontWeight: 700, color: S.volt }}>{displayName}</td>
                            <td style={cell}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {Object.entries(showCounts).sort((a, b) => b[1] - a[1]).map(([show, count]) => (
                                  <span key={show} style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "4px", padding: "3px 8px", fontSize: "11px", color: S.silver }}>
                                    {show} {count > 1 && <span style={{ color: S.volt }}>×{count}</span>}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ ...cell, fontWeight: 700, color: S.silver }}>{totalViews}</td>
                            <td style={{ ...cell, color: S.clay }}>{lastSeen ? new Date(lastSeen).toLocaleString() : "—"}</td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SHOWS ── */}
      {activeTab === "Shows" && (
        <div>
          {showViewerData.length > 0
            ? <ShowViewerBreakdown shows={showViewerData} passwordToName={passwordToName} />
            : <p style={{ color: S.clay, fontFamily: S.fontMono, fontSize: "13px" }}>No show views recorded yet.</p>}
        </div>
      )}

      {/* ── USERS ── */}
      {activeTab === "Users" && (
        <div>
          {userBreakdownData.length > 0
            ? <UserBreakdown users={userBreakdownData} passwordToName={passwordToName} />
            : <p style={{ color: S.clay, fontFamily: S.fontMono, fontSize: "13px" }}>No user activity recorded yet.</p>}
        </div>
      )}

      {/* ── RSVPs ── */}
      {activeTab === "RSVPs" && (
        <div>
          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>{["Time", "Name", "Email", "Company", "Title"].map((h) => <th key={h} style={headCell as React.CSSProperties}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {!rsvps || rsvps.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...cell, color: S.clay, textAlign: "center" }}>No RSVPs yet</td></tr>
                ) : rsvps.map((r, i) => (
                  <tr key={r.id ?? i} style={{ borderBottom: `1px solid ${S.line}` }}>
                    <td style={{ ...cell, color: S.clay, whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ ...cell, fontWeight: 600, color: S.silver }}>{r.name}</td>
                    <td style={{ ...cell, color: S.volt }}>{r.email}</td>
                    <td style={{ ...cell, color: S.clay }}>{r.company}</td>
                    <td style={{ ...cell, color: S.clay }}>{r.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VIP INFO ── */}
      {activeTab === "VIP Info" && (
        <div>
          <VipInfoTab initialAccounts={vipAccounts} engagementByUser={engagementByUser} />
        </div>
      )}

      {/* ── ACCOUNTS ── */}
      {activeTab === "Accounts" && (
        <div>
          <VipAccountManager initialAccounts={vipAccounts} />
        </div>
      )}

      {/* ── LOGINS ── */}
      {activeTab === "Logins" && (
        <div>
          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>{["Time", "Name", "Company", "Password", "IP Address", "Browser"].map((h) => <th key={h} style={headCell as React.CSSProperties}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {logins.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...cell, color: S.clay, textAlign: "center" }}>No logins yet</td></tr>
                ) : logins.map((e, i) => {
                  const displayName = e.password_used ? (passwordToName[e.password_used] ?? null) : null;
                  const [name, company] = displayName ? displayName.split(" · ") : [null, null];
                  return (
                    <tr key={e.id ?? i} style={{ borderBottom: `1px solid ${S.line}` }}>
                      <td style={{ ...cell, color: S.silver, whiteSpace: "nowrap" }}>{new Date(e.created_at).toLocaleString()}</td>
                      <td style={{ ...cell, fontWeight: 600, color: name ? S.silver : S.clay }}>{name ?? "—"}</td>
                      <td style={{ ...cell, color: S.clay }}>{company ?? "—"}</td>
                      <td style={cell}><span style={{ background: S.volt, color: S.night, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>{e.password_used}</span></td>
                      <td style={{ ...cell, color: S.clay }}>{e.ip}</td>
                      <td style={{ ...cell, color: S.clay, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.user_agent?.split(" ")[0]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* ── SHOW ENGAGEMENT MODAL ── */}
      {selectedShow && (
        <div
          onClick={() => setSelectedShow(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
          >
            {/* Header */}
            <div style={{ padding: "24px 28px", borderBottom: `1px solid ${S.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "6px" }}>Show Engagement</div>
                <div style={{ fontFamily: S.fontDisplay, fontSize: "24px", fontWeight: 700, color: S.silver, letterSpacing: "-0.02em" }}>{selectedShow}</div>
                <div style={{ fontSize: "12px", color: S.clay, marginTop: "4px" }}>Ranked by total button clicks</div>
              </div>
              <button
                onClick={() => setSelectedShow(null)}
                style={{ background: "transparent", border: `1px solid ${S.line}`, borderRadius: "50%", color: S.clay, width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            {/* Table */}
            <div style={{ padding: "20px 28px" }}>
              {showEngagement.length === 0 ? (
                <p style={{ color: S.clay, fontSize: "13px", textAlign: "center", padding: "24px 0" }}>No engagement data for this show yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: S.night, borderRadius: "6px" }}>
                      {["#", "User", "Views", "YouTube", "Spotify", "Sizzle", "One-Sheet", "Total Clicks"].map((h) => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: h === "#" || h === "Total Clicks" || h === "Views" || h === "YouTube" || h === "Spotify" || h === "Sizzle" || h === "One-Sheet" ? "center" : "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {showEngagement.map((row, i) => (
                      <tr key={row.displayName} style={{ borderBottom: `1px solid ${S.line}` }}>
                        <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: i === 0 ? S.volt : S.clay, fontFamily: S.fontDisplay, fontSize: "16px" }}>{i + 1}</td>
                        <td style={{ padding: "12px", fontWeight: 600, color: S.silver }}>{row.displayName}</td>
                        <td style={{ padding: "12px", textAlign: "center", color: S.clay }}>{row.views}</td>
                        <td style={{ padding: "12px", textAlign: "center", color: row.youtubeClicks > 0 ? S.silver : S.line }}>{row.youtubeClicks || "—"}</td>
                        <td style={{ padding: "12px", textAlign: "center", color: row.spotifyClicks > 0 ? S.silver : S.line }}>{row.spotifyClicks || "—"}</td>
                        <td style={{ padding: "12px", textAlign: "center", color: row.sizzleClicks > 0 ? S.silver : S.line }}>{row.sizzleClicks || "—"}</td>
                        <td style={{ padding: "12px", textAlign: "center", color: row.onesheetClicks > 0 ? S.silver : S.line }}>{row.onesheetClicks || "—"}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span style={{ background: row.totalClicks > 0 ? S.volt : S.line, color: row.totalClicks > 0 ? S.night : S.clay, fontWeight: 700, fontSize: "12px", padding: "3px 10px", borderRadius: "999px" }}>
                            {row.totalClicks}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
