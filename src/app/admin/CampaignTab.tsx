"use client";

import { useState } from "react";
import { sendCampaignEmail } from "@/app/actions";
import type { CampaignEmailType } from "@/lib/types";

const S = {
  night:       "#0B0909",
  slate:       "#212922",
  volt:        "#E3F643",
  silver:      "#FAF7F4",
  clay:        "#94958B",
  line:        "#2E332E",
  lineStrong:  "#3F4640",
  fontMono:    '"Space Grotesk", monospace',
  pill:        "999px",
};

const STAGE_CONFIG = {
  not_contacted: { label: "Not Contacted", color: S.clay,      bg: "rgba(148,149,139,0.1)", border: "rgba(148,149,139,0.25)" },
  invited:       { label: "Invited",       color: S.volt,      bg: "rgba(227,246,67,0.08)", border: "rgba(227,246,67,0.25)" },
  in_sequence:   { label: "In Sequence",   color: "#FF8C00",   bg: "rgba(255,140,0,0.08)",  border: "rgba(255,140,0,0.25)" },
  rsvpd:         { label: "RSVPd ✓",       color: "#0BDD65",   bg: "rgba(11,221,101,0.08)", border: "rgba(11,221,101,0.25)" },
} as const;

type Stage = keyof typeof STAGE_CONFIG;

type VipAccount = {
  id?: string;
  name: string;
  email: string;
  company: string;
  title: string;
  point_of_contact?: string;
  created_at: string;
};

type EmailLogEntry = {
  id: string;
  recipient_email: string;
  type: string;
  sent_by: string;
  created_at: string;
};

type RsvpEntry = {
  email: string;
  name: string;
  company: string;
};

type ContactRow = VipAccount & {
  stage: Stage;
  emailCount: number;
  lastEmailDate: string | null;
  daysSinceLast: number | null;
  outreachCount: number;
  followupCount: number;
};

function daysBetween(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function deriveStage(
  email: string,
  logs: EmailLogEntry[],
  rsvpSet: Set<string>,
  localSent: CampaignEmailType | null,
): Stage {
  if (rsvpSet.has(email)) return "rsvpd";
  const types = new Set(logs.map((l) => l.type));
  if (localSent === "ae_followup" || types.has("ae_followup")) return "in_sequence";
  if (localSent === "ae_outreach" || types.has("ae_outreach")) return "invited";
  return "not_contacted";
}

function relativeTime(date: string): string {
  const days = daysBetween(date);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CampaignTab({
  vipAccounts,
  emailLog,
  rsvps,
}: {
  vipAccounts: VipAccount[];
  emailLog: EmailLogEntry[];
  rsvps: RsvpEntry[];
}) {
  const [filter, setFilter] = useState<Stage | "all">("all");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [localSent, setLocalSent] = useState<Record<string, CampaignEmailType>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rsvpSet = new Set(rsvps.map((r) => r.email.toLowerCase()));

  const logByEmail: Record<string, EmailLogEntry[]> = {};
  for (const e of emailLog) {
    const k = e.recipient_email.toLowerCase();
    (logByEmail[k] ??= []).push(e);
  }

  const contacts: ContactRow[] = vipAccounts.map((acc) => {
    const email = acc.email.toLowerCase();
    const logs = (logByEmail[email] ?? []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const outreachCount = logs.filter((l) => l.type === "ae_outreach").length;
    const followupCount = logs.filter((l) => l.type === "ae_followup").length;
    const lastEmailDate = logs[0]?.created_at ?? null;

    return {
      ...acc,
      stage: deriveStage(email, logs, rsvpSet, localSent[email] ?? null),
      emailCount: logs.length,
      lastEmailDate,
      daysSinceLast: lastEmailDate ? daysBetween(lastEmailDate) : null,
      outreachCount,
      followupCount,
    };
  });

  // Funnel counts
  const counts = { not_contacted: 0, invited: 0, in_sequence: 0, rsvpd: 0 };
  for (const c of contacts) counts[c.stage]++;
  const total = contacts.length;
  const convRate = total > 0 ? Math.round((counts.rsvpd / total) * 100) : 0;

  const filtered = contacts
    .filter((c) => filter === "all" || c.stage === filter)
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        (c.point_of_contact ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const stageOrder: Record<Stage, number> = { not_contacted: 0, invited: 1, in_sequence: 2, rsvpd: 3 };
      return stageOrder[a.stage] - stageOrder[b.stage];
    });

  async function handleSend(contact: ContactRow, type: "ae_outreach" | "ae_followup") {
    setSending(contact.email);
    setErrors((prev) => { const n = { ...prev }; delete n[contact.email]; return n; });
    const result = await sendCampaignEmail({
      recipientEmail: contact.email,
      recipientName: contact.name,
      recipientCompany: contact.company,
      emailType: type,
      aeName: contact.point_of_contact ?? null,
      sentBy: "admin",
    });
    setSending(null);
    if (result.success) {
      setLocalSent((prev) => ({ ...prev, [contact.email]: type }));
    } else {
      setErrors((prev) => ({ ...prev, [contact.email]: result.error }));
    }
  }

  const cell: React.CSSProperties = { padding: "12px 16px", borderBottom: `1px solid ${S.line}`, fontSize: "13px", color: S.silver, verticalAlign: "middle" };
  const headCell: React.CSSProperties = { ...cell, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, background: S.slate };

  return (
    <div>

      {/* ── Funnel stats ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "stretch" }}>
        {(["not_contacted", "invited", "in_sequence", "rsvpd"] as Stage[]).map((stage) => {
          const cfg = STAGE_CONFIG[stage];
          const pct = total > 0 ? Math.round((counts[stage] / total) * 100) : 0;
          return (
            <button
              key={stage}
              onClick={() => setFilter(filter === stage ? "all" : stage)}
              style={{
                flex: "1 1 120px",
                background: filter === stage ? cfg.bg : S.slate,
                border: `1px solid ${filter === stage ? cfg.border : S.line}`,
                borderRadius: "10px",
                padding: "18px 22px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontFamily: S.fontMono, fontSize: "30px", fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{counts[stage]}</div>
              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color, opacity: 0.8, marginTop: "6px" }}>{cfg.label}</div>
              <div style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.lineStrong, marginTop: "4px" }}>{pct}% of list</div>
            </button>
          );
        })}
        <div style={{ flex: "0 0 auto", background: S.slate, border: `1px solid ${S.line}`, borderRadius: "10px", padding: "18px 22px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: S.fontMono, fontSize: "30px", fontWeight: 700, color: S.volt, lineHeight: 1 }}>{convRate}%</div>
          <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginTop: "6px" }}>Conversion</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "4px", background: S.night, border: `1px solid ${S.line}`, borderRadius: S.pill, padding: "4px" }}>
          {(["all", "not_contacted", "invited", "in_sequence", "rsvpd"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? S.volt : "transparent",
                color: filter === f ? S.night : S.clay,
                border: "none",
                fontFamily: S.fontMono,
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "7px 14px",
                borderRadius: S.pill,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {f === "all" ? `All (${total})` : f === "not_contacted" ? `Not Contacted (${counts.not_contacted})` : f === "invited" ? `Invited (${counts.invited})` : f === "in_sequence" ? `In Sequence (${counts.in_sequence})` : `RSVPd (${counts.rsvpd})`}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, company, AE…"
          style={{
            marginLeft: "auto",
            background: S.night,
            border: `1px solid ${S.line}`,
            borderRadius: S.pill,
            color: S.silver,
            fontFamily: S.fontMono,
            fontSize: "12px",
            padding: "8px 16px",
            outline: "none",
            width: "220px",
          }}
        />
      </div>

      {/* ── Table ── */}
      <div style={{ border: `1px solid ${S.line}`, borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Company", "AE", "Stage", "Last Email", "Emails Sent", "Action"].map((h) => (
                <th key={h} style={headCell as React.CSSProperties}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...cell, textAlign: "center", color: S.lineStrong }}>
                  No contacts match this filter.
                </td>
              </tr>
            ) : filtered.map((c) => {
              const cfg = STAGE_CONFIG[c.stage];
              const isSending = sending === c.email;
              const justSent = !!localSent[c.email];
              const err = errors[c.email];

              const actionType: "ae_outreach" | "ae_followup" | null =
                c.stage === "not_contacted" ? "ae_outreach" :
                c.stage === "invited" || c.stage === "in_sequence" ? "ae_followup" :
                null;

              const actionLabel =
                c.stage === "not_contacted" ? "Send Invite" :
                c.stage === "invited" ? "Send Follow-up" :
                c.stage === "in_sequence" ? "Follow-up Again" :
                null;

              return (
                <tr key={c.email}>
                  <td style={cell}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.clay }}>{c.email}</div>
                  </td>
                  <td style={{ ...cell, color: S.clay }}>{c.company}</td>
                  <td style={{ ...cell, fontFamily: S.fontMono, fontSize: "11px", color: c.point_of_contact ? S.volt : S.lineStrong }}>
                    {c.point_of_contact || "—"}
                  </td>
                  <td style={cell}>
                    <span style={{
                      fontFamily: S.fontMono,
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: cfg.color,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderRadius: S.pill,
                      padding: "3px 10px",
                      whiteSpace: "nowrap",
                    }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ ...cell, fontFamily: S.fontMono, fontSize: "11px", color: S.clay, whiteSpace: "nowrap" }}>
                    {c.lastEmailDate ? (
                      <>
                        <div>{relativeTime(c.lastEmailDate)}</div>
                        {c.daysSinceLast !== null && c.daysSinceLast > 0 && (
                          <div style={{ fontSize: "10px", color: S.lineStrong }}>{c.daysSinceLast}d ago</div>
                        )}
                      </>
                    ) : "—"}
                  </td>
                  <td style={{ ...cell, fontFamily: S.fontMono, fontSize: "11px", color: S.clay, textAlign: "center" }}>
                    {c.emailCount > 0 ? (
                      <span style={{ color: S.silver, fontWeight: 700 }}>{c.emailCount}</span>
                    ) : "—"}
                  </td>
                  <td style={cell}>
                    {err && (
                      <div style={{ fontFamily: S.fontMono, fontSize: "9px", color: "#FF6060", marginBottom: "4px" }}>{err}</div>
                    )}
                    {c.stage === "rsvpd" ? (
                      <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: "#0BDD65" }}>Confirmed ✓</span>
                    ) : justSent ? (
                      <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.volt }}>Sent ✓</span>
                    ) : actionType ? (
                      <button
                        onClick={() => handleSend(c, actionType)}
                        disabled={isSending}
                        style={{
                          background: c.stage === "not_contacted" ? S.volt : "transparent",
                          color: c.stage === "not_contacted" ? S.night : "#FF8C00",
                          border: c.stage === "not_contacted" ? "none" : "1px solid rgba(255,140,0,0.4)",
                          fontFamily: S.fontMono,
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          padding: "7px 14px",
                          borderRadius: S.pill,
                          cursor: isSending ? "not-allowed" : "pointer",
                          opacity: isSending ? 0.5 : 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isSending ? "Sending…" : actionLabel}
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.lineStrong, marginTop: "12px" }}>
        Showing {filtered.length} of {total} accounts · Auto follow-ups run daily via cron
      </div>
    </div>
  );
}
