"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitRsvp } from "@/app/actions";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  line: "#2E332E",
  lineStrong: "#3F4640",
  pill: "999px",
  fontMono: '"Space Grotesk", ui-monospace, monospace',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
  fontSans: '"Space Grotesk", system-ui, sans-serif',
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  background: S.night,
  border: `1px solid ${hasError ? "#FA3842" : S.lineStrong}`,
  color: S.silver,
  fontFamily: S.fontSans,
  fontSize: "15px",
  padding: "14px 16px",
  outline: "none",
  width: "100%",
  borderRadius: "4px",
  boxSizing: "border-box",
});

const labelStyle: React.CSSProperties = {
  fontFamily: S.fontMono,
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: S.clay,
  marginBottom: "8px",
  display: "block",
};

export default function RsvpForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [state, formAction, isPending] = useActionState(submitRsvp, { error: "", success: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  if (state.success) {
    return (
      <div
        style={{
          background: S.slate,
          border: `1px solid ${S.volt}`,
          borderRadius: "8px",
          padding: "48px 40px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: S.volt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path d="M1 8L7 14L19 1" stroke="#0B0909" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontFamily: S.fontDisplay, fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver }}>
          You&apos;re on the list.
        </div>
        <div style={{ fontFamily: S.fontSans, fontSize: "14px", color: S.clay, maxWidth: "320px", lineHeight: 1.6 }}>
          We&apos;ll be in touch with event details as we get closer to the date.
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label style={labelStyle}>Full Name</label>
          <input name="name" type="text" required placeholder="Jane Smith" style={inputStyle(false)} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" required placeholder="jane@network.com" style={inputStyle(false)} />
        </div>
        <div>
          <label style={labelStyle}>Company</label>
          <input name="company" type="text" required placeholder="NBC Universal" style={inputStyle(false)} />
        </div>
        <div>
          <label style={labelStyle}>Title</label>
          <input name="title" type="text" required placeholder="VP of Partnerships" style={inputStyle(false)} />
        </div>
      </div>

      {state.error && (
        <div style={{ fontFamily: S.fontMono, fontSize: "12px", color: "#FA3842", marginBottom: "16px" }}>
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          background: isPending ? S.lineStrong : S.volt,
          color: S.night,
          border: "none",
          borderRadius: S.pill,
          fontFamily: S.fontMono,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "16px 40px",
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "background 0.15s ease",
        }}
      >
        {isPending ? "Submitting…" : "Confirm Attendance"}
      </button>
    </form>
  );
}
