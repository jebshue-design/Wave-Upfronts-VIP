"use client";

import { useState } from "react";
import { updateVipInfo, logEmail } from "@/app/actions";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  line: "#2E332E",
  lineStrong: "#3F4640",
  fontMono: '"Space Grotesk", monospace',
  fontSans: '"Space Grotesk", system-ui, sans-serif',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
  pill: "999px",
};

const AES = [
  "Tom Defina",
  "Gabby Davino",
  "Larry Menkes",
  "Ethan Abrams",
  "Liane Sousa",
  "Megan Rall",
  "Austie Montgomery",
  "Dean Markus",
  "Meg Jones",
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  invited:    { label: "Invited",     bg: "rgba(148,149,139,0.15)", color: S.clay },
  active:     { label: "Active",      bg: "rgba(227,246,67,0.15)",  color: S.volt },
  rsvpd:      { label: "RSVP'd",      bg: "rgba(10,194,255,0.15)", color: "#0AC2FF" },
  "follow-up":{ label: "Follow-up",   bg: "rgba(255,140,0,0.15)",  color: "#FF8C00" },
  closed:     { label: "Closed",      bg: "rgba(11,221,101,0.15)", color: "#0BDD65" },
};

type VipAccount = {
  id?: string;
  name: string;
  email: string;
  company: string;
  title: string;
  created_at: string;
  point_of_contact?: string;
  past_deals?: string;
  notes?: string;
  client_status?: string;
};

type EngagementStats = {
  totalShowsViewed: number;
  totalClicks: number;
  topViewedShow:  { title: string; views: number }  | null;
  topClickedShow: { title: string; clicks: number } | null;
};

type ShowActivity = {
  title: string;
  views: number;
  youtubeClicks: number;
  spotifyClicks: number;
  onesheetClicks: number;
  audienceExpands: number;
  assetDownloads: number;
  lastSeen: string;
};

type Props = {
  vipAccounts: VipAccount[];
  logins: { created_at: string; password_used?: string; ip?: string }[];
  rsvps: { name: string; email: string; company: string; title: string }[] | null;
  engagementByUser: Record<string, EngagementStats>;
  userBreakdownData: { user: string; shows: ShowActivity[] }[];
  passwordToName: Record<string, string>;
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


export default function PipelineTab({ vipAccounts: initialAccounts, logins, rsvps, engagementByUser, userBreakdownData, passwordToName }: Props) {
  const [accounts, setAccounts] = useState<VipAccount[]>(initialAccounts);
  const [filterAE, setFilterAE] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingAE, setEditingAE] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [logEmailOpenId, setLogEmailOpenId] = useState<string | null>(null);

  // Build login map: email → sorted login dates
  const loginsByEmail: Record<string, string[]> = {};
  for (const login of logins) {
    if (login.password_used) {
      (loginsByEmail[login.password_used.toLowerCase()] ??= []).push(login.created_at);
    }
  }
  const rsvpEmails = new Set((rsvps ?? []).map((r) => r.email.toLowerCase()));

  // Build pipeline rows
  const rows = accounts.map((acc) => {
    const key = acc.email.toLowerCase();
    const userLogins = (loginsByEmail[key] ?? []).sort();
    const lastLogin = userLogins.at(-1) ?? null;
    const loginCount = userLogins.length;
    const hasRsvp = rsvpEmails.has(key);
    const eng = engagementByUser[key] ?? null;

    let effectiveStatus = acc.client_status ?? "";
    if (!["follow-up", "closed"].includes(effectiveStatus)) {
      if (hasRsvp) effectiveStatus = "rsvpd";
      else if (lastLogin) effectiveStatus = "active";
      else effectiveStatus = "invited";
    }

    return { ...acc, userLogins, lastLogin, loginCount, hasRsvp, eng, effectiveStatus };
  });

  // Stats
  const total = rows.length;
  const neverLoggedIn = rows.filter((r) => !r.lastLogin).length;
  const rsvpdCount = rows.filter((r) => r.hasRsvp).length;
  const followUpCount = rows.filter((r) => r.effectiveStatus === "follow-up").length;

  // Filter
  const visible = rows
    .filter((r) => !filterAE || r.point_of_contact === filterAE)
    .filter((r) => !filterStatus || r.effectiveStatus === filterStatus)
    .sort((a, b) => {
      // Sort: follow-up first, then never-logged-in, then by last login desc
      if (a.effectiveStatus === "follow-up" && b.effectiveStatus !== "follow-up") return -1;
      if (b.effectiveStatus === "follow-up" && a.effectiveStatus !== "follow-up") return 1;
      if (!a.lastLogin && b.lastLogin) return -1;
      if (a.lastLogin && !b.lastLogin) return 1;
      if (a.lastLogin && b.lastLogin) return b.lastLogin.localeCompare(a.lastLogin);
      return 0;
    });

  async function saveField(acc: VipAccount, patch: Partial<{ point_of_contact: string; client_status: string; notes: string; past_deals: string }>) {
    if (!acc.id) return;
    setSaving(acc.id);
    const updated = {
      point_of_contact: acc.point_of_contact ?? "",
      past_deals: acc.past_deals ?? "",
      notes: acc.notes ?? "",
      client_status: acc.client_status ?? "",
      ...patch,
    };
    await updateVipInfo(acc.id, updated);
    setAccounts((prev) => prev.map((a) => a.id === acc.id ? { ...a, ...patch } : a));
    setSaving(null);
    setEditingAE(null);
  }

  const cell: React.CSSProperties = { padding: "14px 16px", borderBottom: `1px solid ${S.line}`, fontSize: "13px", color: S.silver, verticalAlign: "top" };
  const headCell: React.CSSProperties = { ...cell, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, background: S.slate, paddingTop: "10px", paddingBottom: "10px" };

  return (
    <div>
      {/* ── Stat chips ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
        {[
          { label: "Total VIP Accounts", value: total, color: S.silver },
          { label: "Never Logged In", value: neverLoggedIn, color: "#FF6060", note: "need outreach" },
          { label: "RSVP'd", value: rsvpdCount, color: "#0AC2FF" },
          { label: "Needs Follow-up", value: followUpCount, color: "#FF8C00" },
        ].map(({ label, value, color, note }) => (
          <div key={label} style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "10px", padding: "20px 24px" }}>
            <div style={{ fontFamily: S.fontDisplay, fontSize: "36px", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginTop: "6px" }}>{label}</div>
            {note && <div style={{ fontFamily: S.fontMono, fontSize: "9px", color: color, marginTop: "3px", opacity: 0.7 }}>{note}</div>}
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* AE filter */}
        <select
          value={filterAE}
          onChange={(e) => setFilterAE(e.target.value)}
          style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "8px", color: filterAE ? S.silver : S.clay, fontFamily: S.fontMono, fontSize: "11px", fontWeight: 600, padding: "8px 14px", cursor: "pointer", outline: "none" }}
        >
          <option value="">All AEs</option>
          {AES.map((ae) => <option key={ae} value={ae}>{ae}</option>)}
        </select>

        {/* Status filter chips */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[{ key: "", label: "All" }, ...Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({ key, label }))].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              style={{
                background: filterStatus === key ? S.volt : "transparent",
                border: `1px solid ${filterStatus === key ? S.volt : S.line}`,
                borderRadius: S.pill,
                color: filterStatus === key ? S.night : S.clay,
                fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "6px 14px", cursor: "pointer",
              }}
            >{label}</button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontFamily: S.fontMono, fontSize: "11px", color: S.clay }}>
          {visible.length} of {total} accounts
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ border: `1px solid ${S.line}`, borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["VIP Account", "Assigned AE", "Status", "Last Login", "Engagement", "RSVP", "Follow-up"].map((h) => (
                <th key={h} style={headCell as React.CSSProperties}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={7} style={{ ...cell, textAlign: "center", color: S.clay }}>No accounts match this filter.</td></tr>
            )}
            {visible.map((row) => {
              const statusCfg = STATUS_CONFIG[row.effectiveStatus] ?? STATUS_CONFIG.invited;
              const isExpanded = expandedId === (row.id ?? row.email);
              const isEditingThisAE = editingAE === (row.id ?? row.email);
              const isSaving = saving === row.id;

              return (
                <>
                  <tr
                    key={row.id ?? row.email}
                    onClick={() => setExpandedId(isExpanded ? null : (row.id ?? row.email))}
                    style={{ cursor: "pointer", background: isExpanded ? "rgba(227,246,67,0.03)" : "transparent", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* VIP */}
                    <td style={cell}>
                      <div style={{ fontWeight: 600, color: S.silver, marginBottom: "2px" }}>{row.name}</div>
                      <div style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.clay }}>{row.company}</div>
                      <div style={{ fontFamily: S.fontMono, fontSize: "9px", color: S.lineStrong, marginTop: "1px" }}>{row.title}</div>
                    </td>

                    {/* AE */}
                    <td style={cell} onClick={(e) => e.stopPropagation()}>
                      {isEditingThisAE ? (
                        <select
                          autoFocus
                          defaultValue={row.point_of_contact ?? ""}
                          onBlur={(e) => { saveField(row, { point_of_contact: e.target.value }); }}
                          onChange={(e) => { saveField(row, { point_of_contact: e.target.value }); }}
                          style={{ background: S.night, border: `1px solid ${S.volt}`, borderRadius: "6px", color: S.silver, fontFamily: S.fontMono, fontSize: "11px", padding: "5px 8px", outline: "none", width: "140px" }}
                        >
                          <option value="">Unassigned</option>
                          {AES.map((ae) => <option key={ae} value={ae}>{ae}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingAE(row.id ?? row.email)}
                          style={{ background: "transparent", border: `1px dashed ${row.point_of_contact ? S.lineStrong : S.line}`, borderRadius: "6px", color: row.point_of_contact ? S.silver : S.lineStrong, fontFamily: S.fontMono, fontSize: "11px", fontWeight: 600, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          {isSaving ? "Saving…" : (row.point_of_contact || "Assign AE")}
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td style={cell} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={row.client_status ?? ""}
                        onChange={(e) => saveField(row, { client_status: e.target.value })}
                        style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.color}33`, borderRadius: S.pill, color: statusCfg.color, fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", padding: "4px 10px", cursor: "pointer", outline: "none", appearance: "none", WebkitAppearance: "none" }}
                      >
                        <option value="">Auto</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="rsvpd">RSVP'd</option>
                        <option value="closed">Closed</option>
                      </select>
                      <div style={{ fontFamily: S.fontMono, fontSize: "9px", color: statusCfg.color, marginTop: "4px" }}>{statusCfg.label}</div>
                    </td>

                    {/* Last Login */}
                    <td style={cell}>
                      {row.lastLogin ? (
                        <>
                          <div style={{ fontFamily: S.fontMono, fontSize: "11px", color: S.silver }}>{relativeTime(row.lastLogin)}</div>
                          <div style={{ fontFamily: S.fontMono, fontSize: "9px", color: S.clay, marginTop: "2px" }}>{row.loginCount}x total</div>
                        </>
                      ) : (
                        <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, color: "#FF6060", background: "rgba(255,96,96,0.1)", border: "1px solid rgba(255,96,96,0.2)", borderRadius: S.pill, padding: "3px 10px" }}>Never</span>
                      )}
                    </td>

                    {/* Engagement */}
                    <td style={cell}>
                      {row.eng ? (
                        <>
                          <div style={{ fontFamily: S.fontMono, fontSize: "11px", color: S.silver }}>{row.eng.totalShowsViewed} show{row.eng.totalShowsViewed !== 1 ? "s" : ""}</div>
                          <div style={{ fontFamily: S.fontMono, fontSize: "9px", color: S.clay, marginTop: "2px" }}>{row.eng.totalClicks} action{row.eng.totalClicks !== 1 ? "s" : ""}</div>
                        </>
                      ) : (
                        <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.lineStrong }}>—</span>
                      )}
                    </td>

                    {/* RSVP */}
                    <td style={{ ...cell, textAlign: "center" }}>
                      {row.hasRsvp ? (
                        <span style={{ fontFamily: S.fontMono, fontSize: "11px", fontWeight: 700, color: "#0AC2FF", background: "rgba(10,194,255,0.1)", border: "1px solid rgba(10,194,255,0.25)", borderRadius: S.pill, padding: "3px 10px" }}>Yes</span>
                      ) : (
                        <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.lineStrong }}>—</span>
                      )}
                    </td>

                    {/* Follow-up flag */}
                    <td style={{ ...cell, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => saveField(row, { client_status: row.client_status === "follow-up" ? "" : "follow-up" })}
                        title={row.client_status === "follow-up" ? "Clear follow-up" : "Flag for follow-up"}
                        style={{ background: row.client_status === "follow-up" ? "rgba(255,140,0,0.15)" : "transparent", border: `1px solid ${row.client_status === "follow-up" ? "#FF8C00" : S.lineStrong}`, borderRadius: "6px", color: row.client_status === "follow-up" ? "#FF8C00" : S.lineStrong, fontSize: "16px", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}
                      >
                        ⚑
                      </button>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr key={`${row.id ?? row.email}-expanded`}>
                      <td colSpan={7} style={{ padding: "0", borderBottom: `1px solid ${S.line}`, background: "rgba(227,246,67,0.02)" }}>
                        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                          {/* Contact */}
                          <div>
                            <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "10px" }}>Contact</div>
                            <div style={{ fontFamily: S.fontMono, fontSize: "11px", color: S.clay, marginBottom: "4px" }}>Email</div>
                            <div style={{ fontSize: "13px", color: S.silver, marginBottom: "12px" }}>
                              <a href={`mailto:${row.email}`} style={{ color: S.volt, textDecoration: "none" }}>{row.email}</a>
                            </div>
                            {row.past_deals && (
                              <>
                                <div style={{ fontFamily: S.fontMono, fontSize: "11px", color: S.clay, marginTop: "12px", marginBottom: "4px" }}>Past Deals</div>
                                <div style={{ fontSize: "13px", color: S.silver, lineHeight: 1.5 }}>{row.past_deals}</div>
                              </>
                            )}
                          </div>

                          {/* Show engagement — full breakdown */}
                          <div style={{ gridColumn: "1 / -1" }}>
                            <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "10px" }}>Show Activity</div>
                            {(() => {
                              const email = row.email.toLowerCase();
                              const userData = userBreakdownData.find((u) => passwordToName[u.user]?.toLowerCase().includes(email) || u.user.toLowerCase() === email);
                              if (!userData || userData.shows.length === 0) return <div style={{ fontFamily: S.fontMono, fontSize: "11px", color: S.lineStrong }}>No show activity yet</div>;

                              const score = (s: typeof userData.shows[0]) =>
                                s.views * 1 + s.youtubeClicks * 2 + s.spotifyClicks * 2 + s.audienceExpands * 3 + s.onesheetClicks * 4 + s.assetDownloads * 5;
                              const topShow = userData.shows.reduce((best, s) => score(s) > score(best) ? s : best, userData.shows[0]);
                              const topScore = score(topShow);

                              return (
                                <>
                                {topScore > 0 && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(227,246,67,0.06)", border: "1px solid rgba(227,246,67,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px" }}>
                                    <div style={{ fontSize: "18px" }}>★</div>
                                    <div>
                                      <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "3px" }}>Top Show of Interest</div>
                                      <div style={{ fontFamily: S.fontDisplay, fontSize: "15px", fontWeight: 700, color: S.silver }}>{topShow.title}</div>
                                      <div style={{ fontFamily: S.fontMono, fontSize: "9px", color: S.clay, marginTop: "2px" }}>
                                        {[
                                          topShow.views > 0 && `${topShow.views} view${topShow.views !== 1 ? "s" : ""}`,
                                          topShow.youtubeClicks > 0 && `${topShow.youtubeClicks} trailer`,
                                          topShow.spotifyClicks > 0 && `${topShow.spotifyClicks} audio`,
                                          topShow.onesheetClicks > 0 && `${topShow.onesheetClicks} one-sheet`,
                                          topShow.audienceExpands > 0 && `${topShow.audienceExpands} aud. expand${topShow.audienceExpands !== 1 ? "s" : ""}`,
                                          topShow.assetDownloads > 0 && `${topShow.assetDownloads} asset download${topShow.assetDownloads !== 1 ? "s" : ""}`,
                                        ].filter(Boolean).join(" · ")}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", fontFamily: S.fontMono }}>
                                  <thead>
                                    <tr>
                                      {([
                                        { label: "Show", tip: null },
                                        { label: "Views", tip: "How many times they opened this show card" },
                                        { label: "Trailer", tip: "Clicked the YouTube trailer link" },
                                        { label: "Audio", tip: "Clicked the Spotify / audio link" },
                                        { label: "One-Sheet", tip: "Opened or downloaded the one-sheet PDF" },
                                        { label: "Aud. Expands", tip: "Expanded the audience demographics section" },
                                        { label: "Assets", tip: "Downloaded a file from the assets tab" },
                                        { label: "Last Seen", tip: "Most recent time they opened this show" },
                                      ] as { label: string; tip: string | null }[]).map(({ label, tip }) => (
                                        <th key={label} title={tip ?? undefined} style={{ padding: "6px 10px", textAlign: label === "Show" || label === "Last Seen" ? "left" : "center", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}`, cursor: tip ? "help" : "default" }}>{label}{tip && <span style={{ marginLeft: "3px", opacity: 0.5 }}>?</span>}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userData.shows.map((s) => (
                                      <tr key={s.title} style={{ borderBottom: `1px solid ${S.line}` }}>
                                        <td style={{ padding: "8px 10px", fontWeight: 600, color: S.silver }}>{s.title}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "center", color: S.volt, fontWeight: 700 }}>{s.views}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "center", color: s.youtubeClicks > 0 ? S.silver : S.lineStrong }}>{s.youtubeClicks || "—"}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "center", color: s.spotifyClicks > 0 ? S.silver : S.lineStrong }}>{s.spotifyClicks || "—"}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "center", color: s.onesheetClicks > 0 ? S.silver : S.lineStrong }}>{s.onesheetClicks || "—"}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "center", color: s.audienceExpands > 0 ? S.silver : S.lineStrong }}>{s.audienceExpands || "—"}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "center", color: s.assetDownloads > 0 ? S.silver : S.lineStrong }}>{s.assetDownloads || "—"}</td>
                                        <td style={{ padding: "8px 10px", color: S.clay, whiteSpace: "nowrap" }}>{s.lastSeen}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                </>
                              );
                            })()}
                          </div>

                          {/* Notes + Log Email */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "10px" }}>Notes</div>
                              <NoteEditor account={row} onSave={(notes) => saveField(row, { notes })} />
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt }}>AE Email Log</div>
                                {logEmailOpenId !== (row.id ?? row.email) && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setLogEmailOpenId(row.id ?? row.email ?? null); }}
                                    style={{ background: "transparent", border: `1px solid ${S.lineStrong}`, borderRadius: S.pill, color: S.clay, fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 12px", cursor: "pointer" }}
                                  >+ Log Email</button>
                                )}
                              </div>
                              {logEmailOpenId === (row.id ?? row.email) ? (
                                <LogEmailForm
                                  account={row}
                                  onDone={() => setLogEmailOpenId(null)}
                                />
                              ) : (
                                <div style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.lineStrong }}>Log when an AE sends an outreach email.</div>
                              )}
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EMAIL_TYPE_OPTIONS = [
  { value: "ae_outreach",  label: "Initial Outreach" },
  { value: "ae_followup",  label: "Follow-up" },
  { value: "ae_onesheet",  label: "One-Sheet Sent" },
  { value: "ae_custom",    label: "Custom" },
];

function LogEmailForm({ account, onDone }: { account: VipAccount; onDone: () => void }) {
  const [type, setType] = useState("ae_outreach");
  const [sentBy, setSentBy] = useState(account.point_of_contact ?? "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await logEmail({
      recipient_email: account.email,
      recipient_name: account.name,
      type,
      sent_by: sentBy || "Unknown AE",
      notes: notes || undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(onDone, 1200);
  }

  if (saved) {
    return <div style={{ fontFamily: S.fontMono, fontSize: "11px", color: "#0BDD65", padding: "8px 0" }}>Logged.</div>;
  }

  return (
    <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "6px", color: S.silver, fontFamily: S.fontMono, fontSize: "11px", padding: "7px 10px", outline: "none" }}
      >
        {EMAIL_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input
        type="text"
        placeholder="Sent by (AE name)"
        value={sentBy}
        onChange={(e) => setSentBy(e.target.value)}
        style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "6px", color: S.silver, fontFamily: S.fontMono, fontSize: "11px", padding: "7px 10px", outline: "none" }}
      />
      <input
        type="text"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "6px", color: S.silver, fontFamily: S.fontMono, fontSize: "11px", padding: "7px 10px", outline: "none" }}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{ background: S.volt, color: S.night, border: "none", fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 14px", borderRadius: S.pill, cursor: "pointer" }}
        >{saving ? "Saving…" : "Log"}</button>
        <button
          type="button"
          onClick={onDone}
          style={{ background: "transparent", border: `1px solid ${S.line}`, color: S.clay, fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 12px", borderRadius: S.pill, cursor: "pointer" }}
        >Cancel</button>
      </div>
    </form>
  );
}

function NoteEditor({ account, onSave }: { account: VipAccount; onSave: (notes: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(account.notes ?? "");

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        style={{ minHeight: "60px", background: S.night, border: `1px dashed ${S.lineStrong}`, borderRadius: "8px", padding: "10px 12px", cursor: "text", fontSize: "13px", color: value ? S.silver : S.lineStrong, lineHeight: 1.6 }}
      >
        {value || "Click to add notes…"}
      </div>
    );
  }

  return (
    <div>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: "100%", minHeight: "80px", background: S.night, border: `1px solid ${S.volt}`, borderRadius: "8px", color: S.silver, fontFamily: S.fontSans, fontSize: "13px", padding: "10px 12px", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button
          onClick={() => { onSave(value); setEditing(false); }}
          style={{ background: S.volt, color: S.night, border: "none", fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 16px", borderRadius: S.pill, cursor: "pointer" }}
        >Save</button>
        <button
          onClick={() => { setValue(account.notes ?? ""); setEditing(false); }}
          style={{ background: "transparent", border: `1px solid ${S.line}`, color: S.clay, fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 14px", borderRadius: S.pill, cursor: "pointer" }}
        >Cancel</button>
      </div>
    </div>
  );
}
