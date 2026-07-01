"use client";

import { useState } from "react";
import { updateVipInfo } from "@/app/actions";

const S = {
  night:    "#0B0909",
  slate:    "#212922",
  volt:     "#E3F643",
  silver:   "#FAF7F4",
  clay:     "#94958B",
  line:     "#2E332E",
  fontMono: '"Space Grotesk", monospace',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
};

export type VipAccount = {
  id?: string;
  name: string;
  email: string;
  company: string;
  title: string;
  password: string;
  created_at: string;
  point_of_contact?: string;
  past_deals?: string;
  notes?: string;
  client_status?: string;
};

type ModalState = {
  account: VipAccount;
  point_of_contact: string;
  past_deals: string;
  notes: string;
  client_status: string;
  saving: boolean;
  saved: boolean;
  error: string;
};

const inputStyle: React.CSSProperties = {
  background: S.night,
  border: `1px solid ${S.line}`,
  borderRadius: "6px",
  color: S.silver,
  fontFamily: S.fontMono,
  fontSize: "13px",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: S.clay,
  marginBottom: "6px",
};

type EngagementStats = {
  topViewedShow:  { title: string; views: number }  | null;
  topClickedShow: { title: string; clicks: number } | null;
  topTimeShow:    { title: string; seconds: number } | null;
  totalShowsViewed: number;
  totalClicks: number;
  totalTimeSeconds: number;
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function VipInfoTab({ initialAccounts, engagementByUser }: { initialAccounts: VipAccount[]; engagementByUser: Record<string, EngagementStats> }) {
  const [accounts, setAccounts] = useState<VipAccount[]>(initialAccounts);
  const [modal, setModal] = useState<ModalState | null>(null);

  const openModal = (account: VipAccount) => {
    setModal({
      account,
      point_of_contact: account.point_of_contact ?? "",
      past_deals:       account.past_deals ?? "",
      notes:            account.notes ?? "",
      client_status:    account.client_status ?? "",
      saving: false,
      saved:  false,
      error:  "",
    });
  };

  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!modal || !modal.account.id) return;
    setModal((m) => m ? { ...m, saving: true, error: "" } : m);
    const result = await updateVipInfo(modal.account.id, {
      point_of_contact: modal.point_of_contact,
      past_deals:       modal.past_deals,
      notes:            modal.notes,
      client_status:    modal.client_status,
    });
    if (result.success) {
      setAccounts((prev) => prev.map((a) =>
        a.id === modal.account.id
          ? { ...a, point_of_contact: modal.point_of_contact, past_deals: modal.past_deals, notes: modal.notes, client_status: modal.client_status }
          : a
      ));
      setModal((m) => m ? { ...m, saving: false, saved: true } : m);
      setTimeout(() => setModal((m) => m ? { ...m, saved: false } : m), 2000);
    } else {
      setModal((m) => m ? { ...m, saving: false, error: result.error } : m);
    }
  };

  const cell: React.CSSProperties = { padding: "14px 16px", borderBottom: `1px solid ${S.line}` };

  return (
    <>
      {/* Table */}
      <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: S.slate }}>
              {["Name", "Company", "Title", "Wave Contact", "Notes"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, borderBottom: `1px solid ${S.line}` }}>{h}</th>
              ))}
              <th style={{ padding: "12px 16px", borderBottom: `1px solid ${S.line}` }} />
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "32px 16px", color: S.clay, textAlign: "center" }}>No VIP accounts yet. Create them in the Accounts tab.</td></tr>
            ) : accounts.map((acc) => (
              <tr
                key={acc.id ?? acc.password}
                style={{ borderBottom: `1px solid ${S.line}`, cursor: "pointer", transition: "background 0.15s" }}
                onClick={() => openModal(acc)}
                onMouseEnter={(e) => (e.currentTarget.style.background = S.slate)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ ...cell, fontWeight: 700, color: S.silver }}>{acc.name}</td>
                <td style={{ ...cell, color: S.clay }}>{acc.company}</td>
                <td style={{ ...cell, color: S.clay }}>{acc.title}</td>
                <td style={{ ...cell, color: acc.point_of_contact ? S.silver : S.line }}>
                  {acc.point_of_contact || "—"}
                </td>
                <td style={{ ...cell, color: S.clay, maxWidth: "200px" }}>
                  {acc.notes
                    ? <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{acc.notes}</span>
                    : <span style={{ color: S.line }}>—</span>}
                </td>
                <td style={{ ...cell, textAlign: "right" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.volt }}>View →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: S.slate, border: `1px solid ${S.line}`, borderRadius: "16px", width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}
          >
            {/* Header */}
            <div style={{ padding: "28px 28px 24px", borderBottom: `1px solid ${S.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "6px" }}>VIP Profile</div>
                <div style={{ fontFamily: S.fontDisplay, fontSize: "26px", fontWeight: 700, color: S.silver, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{modal.account.name}</div>
                <div style={{ fontSize: "13px", color: S.clay, marginTop: "6px" }}>{modal.account.title} · {modal.account.company}</div>
              </div>
              <button
                onClick={closeModal}
                style={{ background: "transparent", border: `1px solid ${S.line}`, borderRadius: "50%", color: S.clay, width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            {/* Account details strip */}
            <div style={{ padding: "16px 28px", borderBottom: `1px solid ${S.line}`, display: "flex", gap: "32px", flexWrap: "wrap" }}>
              {[
                { label: "Email",    value: modal.account.email },
                { label: "Password", value: modal.account.password },
                { label: "Added",    value: new Date(modal.account.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontSize: "12px", fontFamily: label === "Password" ? "monospace" : S.fontMono, color: label === "Password" ? S.volt : S.silver }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Engagement stats */}
            {(() => {
              const eng = engagementByUser[modal.account.password];
              if (!eng) return (
                <div style={{ padding: "16px 28px", borderBottom: `1px solid ${S.line}` }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Engagement</div>
                  <div style={{ fontSize: "12px", color: S.line }}>No activity recorded yet</div>
                </div>
              );
              return (
                <div style={{ padding: "20px 28px", borderBottom: `1px solid ${S.line}` }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "14px" }}>Engagement</div>

                  {/* Summary chips */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {[
                      { label: "Shows Explored",  value: String(eng.totalShowsViewed) },
                      { label: "Total Actions",    value: String(eng.totalClicks) },
                      { label: "Total Watch Time", value: formatTime(eng.totalTimeSeconds) },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "8px", padding: "10px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: S.volt }}>{value}</div>
                        <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay, marginTop: "3px" }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top shows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      eng.topViewedShow  && { label: "Most Viewed",    detail: eng.topViewedShow.title,  sub: `${eng.topViewedShow.views} open${eng.topViewedShow.views !== 1 ? "s" : ""}` },
                      eng.topClickedShow && { label: "Most Clicked",   detail: eng.topClickedShow.title, sub: `${eng.topClickedShow.clicks} click${eng.topClickedShow.clicks !== 1 ? "s" : ""}` },
                      eng.topTimeShow    && { label: "Most Time Spent", detail: eng.topTimeShow.title,   sub: formatTime(eng.topTimeShow.seconds) },
                    ].filter(Boolean).map((row) => row && (
                      <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "12px", background: S.night, border: `1px solid ${S.line}`, borderRadius: "8px", padding: "10px 14px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay }}>{row.label}</div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: S.silver, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.detail}</div>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: S.volt, flexShrink: 0 }}>{row.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* CRM fields */}
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>

              <div>
                <label style={labelStyle}>Client Status</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["New", "Existing"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setModal((m) => m ? { ...m, client_status: m.client_status === option ? "" : option } : m)}
                      style={{
                        background: modal.client_status === option ? S.volt : "transparent",
                        color: modal.client_status === option ? S.night : S.clay,
                        border: `1px solid ${modal.client_status === option ? S.volt : S.line}`,
                        borderRadius: "999px",
                        fontFamily: S.fontMono,
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "8px 20px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {option} Client
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Wave Point of Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Jeb Shue"
                  value={modal.point_of_contact}
                  onChange={(e) => setModal((m) => m ? { ...m, point_of_contact: e.target.value } : m)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Past Deals with Wave</label>
                <textarea
                  placeholder="Describe any prior partnerships, sponsorships, or deals..."
                  value={modal.past_deals}
                  onChange={(e) => setModal((m) => m ? { ...m, past_deals: e.target.value } : m)}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Communication Notes</label>
                <textarea
                  placeholder="Prior calls, emails, meetings, key context..."
                  value={modal.notes}
                  onChange={(e) => setModal((m) => m ? { ...m, notes: e.target.value } : m)}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {modal.error && (
                <div style={{ fontSize: "12px", color: "#ff6b6b" }}>{modal.error}</div>
              )}

              <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                <button
                  onClick={handleSave}
                  disabled={modal.saving}
                  style={{ background: modal.saved ? "#2d5a2d" : S.volt, color: modal.saved ? "#7dd87d" : S.night, border: "none", borderRadius: "999px", fontFamily: S.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 28px", cursor: modal.saving ? "wait" : "pointer", transition: "background 0.2s, color 0.2s" }}
                >
                  {modal.saving ? "Saving…" : modal.saved ? "Saved ✓" : "Save Changes"}
                </button>
                <button
                  onClick={closeModal}
                  style={{ background: "transparent", color: S.clay, border: `1px solid ${S.line}`, borderRadius: "999px", fontFamily: S.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
