"use client";

import { useState, useTransition } from "react";
import { adminRsvp } from "@/app/actions";

const S = {
  night:      "#0B0909",
  slate:      "#212922",
  volt:       "#E3F643",
  silver:     "#FAF7F4",
  clay:       "#94958B",
  line:       "#2E332E",
  lineStrong: "#3F4640",
  orange:     "#FF8C00",
  blue:       "#0AC2FF",
  fontMono:   '"Space Grotesk", monospace',
};

const cell: React.CSSProperties = { padding: "12px 16px", borderBottom: `1px solid ${S.line}` };
const headCell: React.CSSProperties = {
  ...cell,
  fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", color: S.clay, background: S.slate,
};

type VipAccount = {
  id?: string;
  name: string;
  email: string;
  company: string;
  title: string;
  point_of_contact?: string;
  client_status?: string;
};

type EmailLogEntry = {
  recipient_email: string;
  type: string;
  created_at: string;
};

type LoginEntry = {
  password_used?: string;
  created_at: string;
};

type Props = {
  vipAccounts: VipAccount[];
  rsvps: { email: string; rsvp_type?: string }[] | null;
  emailLog: EmailLogEntry[];
  logins: LoginEntry[];
};

function relTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const EMAIL_TYPE_LABEL: Record<string, string> = {
  ae_outreach: "Outreach",
  ae_followup: "Follow-up",
  ae_onesheet: "One-Sheet",
};

export default function FollowUpTab({ vipAccounts, rsvps, emailLog, logins }: Props) {
  const [rsvpdLocally, setRsvpdLocally] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rsvpdEmails = new Set(
    (rsvps ?? [])
      .filter((r) => r.rsvp_type !== "decline")
      .map((r) => r.email.toLowerCase())
  );

  const loggedInEmails = new Set(
    logins.map((l) => (l.password_used ?? "").toLowerCase()).filter(Boolean)
  );

  const emailsByRecipient: Record<string, EmailLogEntry[]> = {};
  for (const entry of emailLog) {
    const key = entry.recipient_email.toLowerCase();
    if (!emailsByRecipient[key]) emailsByRecipient[key] = [];
    emailsByRecipient[key].push(entry);
  }

  const handleAdminRsvp = (account: VipAccount) => {
    startTransition(async () => {
      const result = await adminRsvp({
        name: account.name,
        email: account.email,
        company: account.company,
        title: account.title,
      });
      if (result.success) {
        setRsvpdLocally((prev) => new Set(prev).add(account.email.toLowerCase()));
      } else {
        setErrors((prev) => ({ ...prev, [account.email.toLowerCase()]: result.error }));
      }
    });
  };

  // Non-responders: in VIP list but no confirmed RSVP, and not just admin-RSVP'd this session
  const nonResponders = vipAccounts.filter(
    (a) => !rsvpdEmails.has(a.email.toLowerCase()) && !rsvpdLocally.has(a.email.toLowerCase())
  );

  // Group by AE
  const byAE: Record<string, VipAccount[]> = {};
  for (const account of nonResponders) {
    const ae = account.point_of_contact || "Unassigned";
    if (!byAE[ae]) byAE[ae] = [];
    byAE[ae].push(account);
  }

  const sortedAEs = Object.entries(byAE).sort(([a], [b]) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

  if (nonResponders.length === 0) {
    return (
      <div style={{ textAlign: "center", color: S.clay, padding: "60px 0", fontFamily: S.fontMono, fontSize: "13px" }}>
        Everyone has RSVP'd. Nothing to follow up on.
      </div>
    );
  }

  return (
    <div style={{ fontFamily: S.fontMono }}>
      {/* Summary bar */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "32px", padding: "16px 20px", background: S.slate, borderRadius: "8px", border: `1px solid ${S.line}` }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: S.silver }}>{nonResponders.length}</div>
          <div style={{ fontSize: "10px", color: S.clay, letterSpacing: "0.06em", textTransform: "uppercase" }}>Need Follow-Up</div>
        </div>
        <div style={{ width: "1px", background: S.line }} />
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: S.blue }}>
            {nonResponders.filter((a) => loggedInEmails.has(a.email.toLowerCase())).length}
          </div>
          <div style={{ fontSize: "10px", color: S.clay, letterSpacing: "0.06em", textTransform: "uppercase" }}>Have Logged In</div>
        </div>
        <div style={{ width: "1px", background: S.line }} />
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: S.orange }}>
            {nonResponders.filter((a) => !loggedInEmails.has(a.email.toLowerCase())).length}
          </div>
          <div style={{ fontSize: "10px", color: S.clay, letterSpacing: "0.06em", textTransform: "uppercase" }}>Never Visited</div>
        </div>
      </div>

      {/* AE sections */}
      {sortedAEs.map(([ae, accounts]) => (
        <div key={ae} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.volt }}>
              {ae}
            </div>
            <div style={{ fontSize: "11px", color: S.clay }}>
              — {accounts.length} {accounts.length === 1 ? "contact" : "contacts"}
            </div>
          </div>

          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>
                  {["Name", "Company", "Last Email", "Logged In", ""].map((h) => (
                    <th key={h} style={headCell as React.CSSProperties}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((a, i) => {
                  const emailKey = a.email.toLowerCase();
                  const emails = emailsByRecipient[emailKey] ?? [];
                  const lastEmail = emails.sort(
                    (x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
                  )[0];
                  const hasLoggedIn = loggedInEmails.has(emailKey);

                  return (
                    <tr key={a.id ?? i}>
                      <td style={{ ...cell, fontWeight: 600, color: S.silver }}>
                        <div>{a.name}</div>
                        <div style={{ fontSize: "11px", color: S.clay, fontWeight: 400 }}>{a.email}</div>
                      </td>
                      <td style={{ ...cell, color: S.clay }}>{a.company}</td>
                      <td style={{ ...cell }}>
                        {lastEmail ? (
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: S.silver }}>
                              {EMAIL_TYPE_LABEL[lastEmail.type] ?? lastEmail.type}
                            </span>
                            <span style={{ fontSize: "11px", color: S.clay, marginLeft: "6px" }}>
                              {relTime(lastEmail.created_at)}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "11px", color: S.orange }}>No emails sent</span>
                        )}
                      </td>
                      <td style={{ ...cell }}>
                        {hasLoggedIn ? (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: S.blue }}>Yes</span>
                        ) : (
                          <span style={{ fontSize: "11px", color: S.clay }}>No</span>
                        )}
                      </td>
                      <td style={{ ...cell, textAlign: "right" }}>
                        {errors[emailKey] && (
                          <span style={{ fontSize: "10px", color: "#FF6060", marginRight: "8px" }}>{errors[emailKey]}</span>
                        )}
                        <button
                          onClick={() => handleAdminRsvp(a)}
                          disabled={pending}
                          style={{
                            background: "transparent",
                            border: `1px solid ${S.volt}`,
                            color: S.volt,
                            fontFamily: S.fontMono,
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "5px 12px",
                            borderRadius: "999px",
                            cursor: pending ? "wait" : "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          RSVP for them
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
