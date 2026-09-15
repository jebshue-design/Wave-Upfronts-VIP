"use client";

import { useState } from "react";
import PipelineTab from "./PipelineTab";
import VipAccountManager from "./VipAccountManager";

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
  logins: { id?: string; created_at: string; password_used?: string; ip?: string; user_agent?: string }[];
  rsvps: { id?: string; created_at: string; name: string; email: string; company: string; title: string; rsvp_type?: string }[] | null;
  vipAccounts: { id?: string; name: string; email: string; company: string; title: string; created_at: string; point_of_contact?: string; past_deals?: string; notes?: string; client_status?: string }[];
  passwordToName: Record<string, string>;
  engagementByUser: Record<string, {
    topViewedShow:  { title: string; views: number }  | null;
    topClickedShow: { title: string; clicks: number } | null;
    totalShowsViewed: number;
    totalClicks: number;
  }>;
  userBreakdownData: {
    user: string; totalViews: number; firstSeen: string; lastSeen: string;
    shows: ShowActivity[];
  }[];
};

const TABS = ["Pipeline", "Users", "RSVPs", "Logins"] as const;
type Tab = typeof TABS[number];

export default function AdminTabs(props: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Pipeline");
  const { logins, rsvps, vipAccounts, passwordToName, engagementByUser, userBreakdownData } = props;

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
      </div>

      {/* ── PIPELINE ── */}
      {activeTab === "Pipeline" && (
        <PipelineTab
          vipAccounts={vipAccounts}
          logins={logins}
          rsvps={rsvps}
          engagementByUser={engagementByUser}
          userBreakdownData={userBreakdownData}
          passwordToName={passwordToName}
        />
      )}

      {/* ── USERS ── */}
      {activeTab === "Users" && (
        <VipAccountManager initialAccounts={vipAccounts} />
      )}

      {/* ── RSVPs ── */}
      {activeTab === "RSVPs" && (
        <div>
          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>{["Time", "Name", "Email", "Company", "Title", "Type"].map((h) => <th key={h} style={headCell as React.CSSProperties}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {!rsvps || rsvps.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...cell, color: S.clay, textAlign: "center" }}>No RSVPs yet</td></tr>
                ) : rsvps.map((r, i) => {
                  const isDecline = r.rsvp_type === "decline";
                  return (
                  <tr key={r.id ?? i} style={{ borderBottom: `1px solid ${S.line}` }}>
                    <td style={{ ...cell, color: S.clay, whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ ...cell, fontWeight: 600, color: S.silver }}>{r.name}</td>
                    <td style={{ ...cell, color: S.volt }}>{r.email}</td>
                    <td style={{ ...cell, color: S.clay }}>{r.company}</td>
                    <td style={{ ...cell, color: S.clay }}>{r.title}</td>
                    <td style={{ ...cell }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: isDecline ? S.clay : S.volt }}>
                        {isDecline ? "Decline" : "Confirm"}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LOGINS ── */}
      {activeTab === "Logins" && (
        <div>
          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>{["Time", "Name", "Company", "Email", "IP Address", "Browser"].map((h) => <th key={h} style={headCell as React.CSSProperties}>{h}</th>)}</tr>
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
                      <td style={{ ...cell, color: S.clay, fontSize: "12px" }}>{e.password_used}</td>
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
    </>
  );
}
