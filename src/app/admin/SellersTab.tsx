/*
 * CREATE TABLE SQL — run this in your Supabase SQL editor before using this feature:
 *
 * create table sellers (
 *   id            uuid primary key default gen_random_uuid(),
 *   name          text not null,
 *   email         text not null unique,
 *   password_hash text not null,
 *   created_at    timestamptz not null default now()
 * );
 *
 * -- Optional: enable RLS and restrict to service role only
 * alter table sellers enable row level security;
 * create policy "service role only" on sellers using (false);
 */

"use client";

import { useActionState, useState } from "react";
import { createSeller, deleteSeller } from "@/app/actions";

const S = {
  night:       "#0B0909",
  slate:       "#212922",
  volt:        "#E3F643",
  silver:      "#FAF7F4",
  clay:        "#94958B",
  line:        "#2E332E",
  lineStrong:  "#3F4640",
  red:         "#FA3842",
  fontMono:    '"Space Grotesk", monospace',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
};

const cell: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: `1px solid ${S.line}`,
  fontFamily: S.fontMono,
  fontSize: "13px",
  color: S.clay,
};

const headCell: React.CSSProperties = {
  ...cell,
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: S.clay,
  background: S.slate,
};

type Seller = { id: string; name: string; email: string; created_at: string };

type Props = {
  sellers: Seller[];
};

export default function SellersTab({ sellers: initialSellers }: Props) {
  const [sellers, setSellers] = useState<Seller[]>(initialSellers);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(createSeller, {
    error: "",
    success: false,
  });

  const inputStyle: React.CSSProperties = {
    background: S.night,
    border: `1px solid ${S.lineStrong}`,
    color: S.silver,
    fontFamily: S.fontMono,
    fontSize: "14px",
    padding: "13px 16px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this seller account? They will no longer be able to log in.")) return;
    setDeletingId(id);
    const result = await deleteSeller(id);
    setDeletingId(null);
    if (result.success) {
      setSellers((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert(result.error || "Failed to delete seller.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

      {/* Add Seller Form */}
      <div style={{ border: `1px solid ${S.line}`, background: S.slate, padding: "32px" }}>
        <h2 style={{ fontFamily: S.fontDisplay, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver, margin: "0 0 24px" }}>
          Add Seller Account
        </h2>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <input
              name="name"
              type="text"
              placeholder="Full Name *"
              required
              style={inputStyle}
            />
            <input
              name="email"
              type="email"
              placeholder="Email *"
              required
              style={inputStyle}
            />
            <input
              name="password"
              type="password"
              placeholder="Password *"
              required
              style={inputStyle}
            />
          </div>

          {state?.error && (
            <div style={{ fontFamily: S.fontMono, fontSize: "12px", color: S.red }}>
              {state.error}
            </div>
          )}
          {state?.success && (
            <div style={{ fontFamily: S.fontMono, fontSize: "12px", color: "#0BDD65" }}>
              Seller account created. Reload the page to see them in the list.
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              style={{
                background: isPending ? "#2A332B" : S.volt,
                color: S.night,
                border: "none",
                borderRadius: "999px",
                fontFamily: S.fontMono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "14px 28px",
                cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              {isPending ? "Creating..." : "Create Seller"}
            </button>
          </div>
        </form>
      </div>

      {/* Sellers List */}
      <div>
        <h2 style={{ fontFamily: S.fontDisplay, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver, margin: "0 0 16px" }}>
          Seller Accounts
          <span style={{ fontFamily: S.fontMono, fontSize: "12px", fontWeight: 400, color: S.clay, marginLeft: "12px" }}>
            {sellers.length} {sellers.length === 1 ? "seller" : "sellers"}
          </span>
        </h2>

        <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name", "Email", "Created", ""].map((h, i) => (
                  <th key={i} style={headCell as React.CSSProperties}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sellers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...cell, textAlign: "center", color: S.clay, padding: "32px" }}>
                    No seller accounts yet.
                  </td>
                </tr>
              ) : (
                sellers.map((s) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${S.line}` }}>
                    <td style={{ ...cell, fontWeight: 600, color: S.silver }}>{s.name}</td>
                    <td style={{ ...cell, color: S.volt }}>{s.email}</td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ ...cell, textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        style={{
                          background: "transparent",
                          border: `1px solid ${S.line}`,
                          color: S.clay,
                          fontFamily: S.fontMono,
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          padding: "6px 14px",
                          cursor: deletingId === s.id ? "not-allowed" : "pointer",
                          borderRadius: "999px",
                        }}
                      >
                        {deletingId === s.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
