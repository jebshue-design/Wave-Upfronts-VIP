"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sellerLogout, sellerAddGuest } from "@/app/actions";

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

type Guest = {
  id?: string;
  name: string;
  email: string;
  company: string;
  title: string;
  created_at: string;
  point_of_contact?: string;
};

type Props = {
  seller: { id: string; name: string; email: string };
  initialGuests: Guest[];
};

export default function SellerDashboard({ seller, initialGuests }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(sellerAddGuest, {
    error: "",
    success: false,
  });

  useEffect(() => {
    if (state.success && state.account) {
      setGuests((prev) => [state.account as Guest, ...prev]);
      formRef.current?.reset();
    }
  }, [state.success, state.account]);

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    background: S.night,
    border: hasError ? `1px solid ${S.red}` : `1px solid ${S.lineStrong}`,
    color: S.silver,
    fontFamily: S.fontMono,
    fontSize: "14px",
    padding: "13px 16px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  });

  return (
    <div style={{ background: S.night, minHeight: "100vh", color: S.silver, padding: "48px 40px", fontFamily: S.fontMono }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "8px" }}>
              Wave Upfronts · Sellers
            </div>
            <h1 style={{ fontFamily: S.fontDisplay, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
              Wave · {seller.name}
            </h1>
          </div>
          <form action={sellerLogout}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: `1px solid ${S.line}`,
                color: S.clay,
                fontFamily: S.fontMono,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "10px 20px",
                cursor: "pointer",
                borderRadius: "999px",
              }}
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Add Guest Form */}
        <div style={{ border: `1px solid ${S.line}`, background: S.slate, padding: "32px", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: S.fontDisplay, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver, margin: "0 0 24px" }}>
            Add Guest
          </h2>

          <form ref={formRef} action={formAction} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <input
                name="name"
                type="text"
                placeholder="Full Name *"
                required
                style={inputStyle(false)}
              />
              <input
                name="email"
                type="email"
                placeholder="Email *"
                required
                style={inputStyle(false)}
              />
              <input
                name="company"
                type="text"
                placeholder="Company *"
                required
                style={inputStyle(false)}
              />
              <input
                name="title"
                type="text"
                placeholder="Title"
                style={inputStyle(false)}
              />
            </div>
            <input
              name="phone"
              type="tel"
              placeholder="Phone (optional)"
              style={inputStyle(false)}
            />

            {state?.error && (
              <div style={{ fontFamily: S.fontMono, fontSize: "12px", color: S.red }}>
                {state.error}
              </div>
            )}
            {state?.success && (
              <div style={{ fontFamily: S.fontMono, fontSize: "12px", color: "#0BDD65" }}>
                Guest added successfully.
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
                {isPending ? "Adding..." : "Add Guest"}
              </button>
            </div>
          </form>
        </div>

        {/* Guests Table */}
        <div>
          <h2 style={{ fontFamily: S.fontDisplay, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver, margin: "0 0 16px" }}>
            Your Guests
            <span style={{ fontFamily: S.fontMono, fontSize: "12px", fontWeight: 400, color: S.clay, marginLeft: "12px" }}>
              {guests.length} {guests.length === 1 ? "guest" : "guests"}
            </span>
          </h2>

          <div style={{ border: `1px solid ${S.line}`, borderRadius: "8px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Company", "Title", "Date Added"].map((h) => (
                    <th key={h} style={headCell as React.CSSProperties}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...cell, textAlign: "center", color: S.clay, padding: "32px" }}>
                      No guests added yet.
                    </td>
                  </tr>
                ) : (
                  guests.map((g, i) => (
                    <tr key={g.id ?? i} style={{ borderBottom: `1px solid ${S.line}` }}>
                      <td style={{ ...cell, fontWeight: 600, color: S.silver }}>{g.name}</td>
                      <td style={{ ...cell, color: S.volt }}>{g.email}</td>
                      <td style={{ ...cell }}>{g.company}</td>
                      <td style={{ ...cell }}>{g.title || "—"}</td>
                      <td style={{ ...cell, whiteSpace: "nowrap" }}>
                        {new Date(g.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
