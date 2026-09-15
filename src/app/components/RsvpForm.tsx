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
  fontMono: '"Zalando Sans", system-ui, sans-serif',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
  fontSans: '"Zalando Sans", system-ui, sans-serif',
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  background: "rgba(255,255,255,0.06)",
  border: `1px solid ${hasError ? "#FA3842" : "rgba(250,247,244,0.18)"}`,
  color: S.silver,
  fontFamily: S.fontSans,
  fontSize: "15px",
  height: "52px",
  padding: "0 16px",
  outline: "none",
  width: "100%",
  borderRadius: "12px",
  textAlign: "left",
  boxSizing: "border-box",
});

const labelStyle: React.CSSProperties = {
  fontFamily: S.fontMono,
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: S.clay,
  display: "block",
  marginBottom: "6px",
};

type UserPrefill = { firstName: string; lastName: string; email: string; company: string; title: string };

export default function RsvpForm({ onSuccess, user }: { onSuccess?: () => void; user?: UserPrefill } = {}) {
  const [state, formAction, isPending] = useActionState(submitRsvp, { error: "", success: false, rsvpType: "confirm" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  if (state.success) {
    return (
      <>
      <style>{`
        .rsvp-confetti { position: absolute; z-index: 3; inset: 0; pointer-events: none; }
        .rsvp-confetti span { position: absolute; top: 50%; left: 50%; width: 7px; height: 12px; border-radius: 2px; background: #E3F643; opacity: 0; animation: rsvp-confetti-burst 1.15s cubic-bezier(.16,1,.3,1) both; }
        .rsvp-confetti span:nth-child(2n) { background: #FAF7F4; }
        .rsvp-confetti span:nth-child(3n) { width: 5px; height: 5px; border-radius: 50%; }
        .rsvp-confetti span:nth-child(1) { --x: -150px; --y: -70px; --r: -35deg; }
        .rsvp-confetti span:nth-child(2) { --x: -112px; --y: -105px; --r: 40deg; }
        .rsvp-confetti span:nth-child(3) { --x: -72px; --y: -132px; --r: -20deg; }
        .rsvp-confetti span:nth-child(4) { --x: -28px; --y: -92px; --r: 55deg; }
        .rsvp-confetti span:nth-child(5) { --x: 25px; --y: -135px; --r: -45deg; }
        .rsvp-confetti span:nth-child(6) { --x: 74px; --y: -98px; --r: 25deg; }
        .rsvp-confetti span:nth-child(7) { --x: 128px; --y: -122px; --r: -30deg; }
        .rsvp-confetti span:nth-child(8) { --x: 155px; --y: -62px; --r: 45deg; }
        .rsvp-confetti span:nth-child(9) { --x: -138px; --y: 30px; --r: 20deg; }
        .rsvp-confetti span:nth-child(10) { --x: 142px; --y: 35px; --r: -50deg; }
        .rsvp-confetti span:nth-child(11) { --x: -92px; --y: 90px; --r: 35deg; }
        .rsvp-confetti span:nth-child(12) { --x: 102px; --y: 92px; --r: -25deg; }
        .rsvp-confetti span:nth-child(13) { --x: -42px; --y: 125px; --r: 50deg; }
        .rsvp-confetti span:nth-child(14) { --x: 48px; --y: 128px; --r: -40deg; }
        .rsvp-confetti span:nth-child(15) { --x: -170px; --y: -5px; --r: 15deg; }
        .rsvp-confetti span:nth-child(16) { --x: 170px; --y: -8px; --r: -15deg; }
        .rsvp-confetti span:nth-child(17) { --x: -4px; --y: -155px; --r: 30deg; }
        .rsvp-confetti span:nth-child(18) { --x: 4px; --y: 150px; --r: -30deg; }
        @keyframes rsvp-confetti-burst {
          from { opacity: 0; transform: translate(-50%, -50%) translate(0, 0) rotate(0) scale(.4); }
          18% { opacity: 1; }
          to { opacity: 0; transform: translate(-50%, -50%) translate(var(--x), var(--y)) rotate(var(--r)) scale(1); }
        }
      `}</style>
      <div
        className="rsvp-success"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "transparent",
          border: "none",
          borderRadius: 0,
          padding: "24px 0",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div className="rsvp-confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
        </div>
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
          {state.rsvpType === "decline" ? "We'll Miss You!" : "Thank you for Confirming!"}
        </div>
        <div style={{ fontFamily: S.fontSans, fontSize: "14px", color: S.clay, maxWidth: "320px", lineHeight: 1.6 }}>
          {state.rsvpType === "decline" ? "We hope to see you at a future event." : "We can't wait to see you there."}
        </div>
      </div>
      </>
    );
  }

  return (
    <form ref={formRef} action={formAction} style={{ display: "grid", gap: "16px", textAlign: "center" }}>
      <style>{`
        .rsvp-confirm:not(:disabled) { background: #FAF7F4; transition: background-color .75s cubic-bezier(.16,1,.3,1), color .75s cubic-bezier(.16,1,.3,1); }
        .rsvp-confirm:not(:disabled):hover { background: #E3F643; }
        .rsvp-field:focus { border-color: rgba(227,246,67,0.6) !important; background: rgba(227,246,67,0.05) !important; }
        .rsvp-confetti { position: absolute; z-index: 3; inset: 0; pointer-events: none; }
        .rsvp-confetti span { position: absolute; top: 50%; left: 50%; width: 7px; height: 12px; border-radius: 2px; background: #E3F643; opacity: 0; animation: rsvp-confetti-burst 1.15s cubic-bezier(.16,1,.3,1) both; }
        .rsvp-confetti span:nth-child(2n) { background: #FAF7F4; }
        .rsvp-confetti span:nth-child(3n) { width: 5px; height: 5px; border-radius: 50%; }
        .rsvp-confetti span:nth-child(1) { --x: -150px; --y: -70px; --r: -35deg; }
        .rsvp-confetti span:nth-child(2) { --x: -112px; --y: -105px; --r: 40deg; }
        .rsvp-confetti span:nth-child(3) { --x: -72px; --y: -132px; --r: -20deg; }
        .rsvp-confetti span:nth-child(4) { --x: -28px; --y: -92px; --r: 55deg; }
        .rsvp-confetti span:nth-child(5) { --x: 25px; --y: -135px; --r: -45deg; }
        .rsvp-confetti span:nth-child(6) { --x: 74px; --y: -98px; --r: 25deg; }
        .rsvp-confetti span:nth-child(7) { --x: 128px; --y: -122px; --r: -30deg; }
        .rsvp-confetti span:nth-child(8) { --x: 155px; --y: -62px; --r: 45deg; }
        .rsvp-confetti span:nth-child(9) { --x: -138px; --y: 30px; --r: 20deg; }
        .rsvp-confetti span:nth-child(10) { --x: 142px; --y: 35px; --r: -50deg; }
        .rsvp-confetti span:nth-child(11) { --x: -92px; --y: 90px; --r: 35deg; }
        .rsvp-confetti span:nth-child(12) { --x: 102px; --y: 92px; --r: -25deg; }
        .rsvp-confetti span:nth-child(13) { --x: -42px; --y: 125px; --r: 50deg; }
        .rsvp-confetti span:nth-child(14) { --x: 48px; --y: 128px; --r: -40deg; }
        .rsvp-confetti span:nth-child(15) { --x: -170px; --y: -5px; --r: 15deg; }
        .rsvp-confetti span:nth-child(16) { --x: 170px; --y: -8px; --r: -15deg; }
        .rsvp-confetti span:nth-child(17) { --x: -4px; --y: -155px; --r: 30deg; }
        .rsvp-confetti span:nth-child(18) { --x: 4px; --y: 150px; --r: -30deg; }
        @keyframes rsvp-confetti-burst {
          from { opacity: 0; transform: translate(-50%, -50%) translate(0, 0) rotate(0) scale(.4); }
          18% { opacity: 1; }
          to { opacity: 0; transform: translate(-50%, -50%) translate(var(--x), var(--y)) rotate(var(--r)) scale(1); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <div>
          <label style={labelStyle}>First Name</label>
          <input name="firstName" type="text" required placeholder="First name" aria-label="First Name" defaultValue={user?.firstName} className="rsvp-field" style={inputStyle(false)} />
        </div>
        <div>
          <label style={labelStyle}>Last Name</label>
          <input name="lastName" type="text" required placeholder="Last name" aria-label="Last Name" defaultValue={user?.lastName} className="rsvp-field" style={inputStyle(false)} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" required placeholder="you@company.com" aria-label="Email Address" defaultValue={user?.email} className="rsvp-field" style={inputStyle(false)} />
        </div>
        <div>
          <label style={labelStyle}>Company</label>
          <input name="company" type="text" required placeholder="Company" aria-label="Company" defaultValue={user?.company} className="rsvp-field" style={inputStyle(false)} />
        </div>
        <div>
          <label style={labelStyle}>Title</label>
          <input name="title" type="text" required placeholder="Title" aria-label="Title" defaultValue={user?.title} className="rsvp-field" style={inputStyle(false)} />
        </div>
      </div>

      {state.error && (
        <div style={{ gridColumn: "1 / -1", fontFamily: S.fontMono, fontSize: "12px", color: "#FA3842", marginBottom: "0" }}>
          {state.error}
        </div>
      )}

      <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          className="rsvp-confirm"
          type="submit"
          name="rsvpType"
          value="confirm"
          disabled={isPending}
          style={{
            background: isPending ? S.lineStrong : undefined,
            color: S.night,
            border: "none",
            borderRadius: S.pill,
            fontFamily: '"Zalando Sans Expanded", system-ui, sans-serif',
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            textTransform: "uppercase",
            height: "48px",
            padding: "0 40px",
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "background-color .75s cubic-bezier(.16,1,.3,1), color .75s cubic-bezier(.16,1,.3,1)",
            width: "100%",
          }}
        >
          {isPending ? "Submitting…" : "Confirm Attendance"}
        </button>
        <button
          type="submit"
          name="rsvpType"
          value="decline"
          disabled={isPending}
          style={{
            background: "transparent",
            color: S.clay,
            border: `1px solid ${S.lineStrong}`,
            borderRadius: S.pill,
            fontFamily: '"Zalando Sans Expanded", system-ui, sans-serif',
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            textTransform: "uppercase",
            height: "48px",
            padding: "0 40px",
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "border-color .2s, color .2s",
            width: "100%",
          }}
        >
          Decline with Regret
        </button>
      </div>
    </form>
  );
}
