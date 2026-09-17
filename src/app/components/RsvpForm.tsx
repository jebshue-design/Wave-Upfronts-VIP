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
  background: S.night,
  border: `1px solid ${hasError ? "#FA3842" : S.lineStrong}`,
  color: S.silver,
  fontFamily: S.fontSans,
  fontSize: "15px",
  height: "48px",
  padding: "0 18px",
  outline: "none",
  width: "100%",
  borderRadius: "999px",
  textAlign: "center",
  boxSizing: "border-box",
});

const labelStyle: React.CSSProperties = {
  fontFamily: S.fontMono,
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: S.clay,
  display: "none",
};

type UserPrefill = { firstName: string; lastName: string; email: string; company: string; title: string };

export default function RsvpForm({ onSuccess, onRsvpComplete, user, existingRsvpType }: { onSuccess?: () => void; onRsvpComplete?: (rsvpType: string) => void; user?: UserPrefill; existingRsvpType?: string | null } = {}) {
  const [state, formAction, isPending] = useActionState(submitRsvp, { error: "", success: false, rsvpType: "confirm" });
  const effectiveSuccess = state.success || !!existingRsvpType;
  const effectiveRsvpType = state.rsvpType || existingRsvpType || "confirm";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onRsvpComplete?.(state.rsvpType ?? "confirm");
    }
  }, [state.success, state.rsvpType, onRsvpComplete]);

  useEffect(() => {
    if (effectiveSuccess) {
      onSuccess?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSuccess, onSuccess]);

  if (effectiveSuccess) {
    return (
      <>
      <style>{`
        .rsvp-confetti { position: fixed; top: 50%; left: 50%; width: 0; height: 0; z-index: 1001; pointer-events: none; }
        .rsvp-confetti span { position: absolute; top: 0; left: 0; width: 7px; height: 12px; border-radius: 2px; background: #E3F643; opacity: 0; animation: rsvp-confetti-burst 1.15s cubic-bezier(.16,1,.3,1) both; }
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
          from { opacity: 0; transform: translate(0, 0) rotate(0) scale(.4); }
          18% { opacity: 1; }
          to { opacity: 0; transform: translate(var(--x), var(--y)) rotate(var(--r)) scale(1); }
        }
      `}</style>
      <div
        className="rsvp-success"
        style={{
          position: "relative",
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
        {effectiveRsvpType !== "decline" && !existingRsvpType && (
          <div className="rsvp-confetti" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => <span key={index} />)}
          </div>
        )}
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
          {effectiveRsvpType === "decline" ? "We'll Miss You!" : existingRsvpType ? "You're Confirmed" : "Thank you for Confirming!"}
        </div>
        <div style={{ fontFamily: S.fontSans, fontSize: "14px", color: S.clay, maxWidth: "320px", lineHeight: 1.6 }}>
          {effectiveRsvpType === "decline" ? "We hope to see you at a future event." : "We can't wait to see you there."}
        </div>
        {effectiveRsvpType !== "decline" && (
          <div style={{ marginTop: "8px", padding: "16px 20px", background: "rgba(255,255,255,.05)", borderRadius: "14px", border: "1px solid rgba(255,255,255,.1)", textAlign: "left", width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#E3F643" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7z"/></svg>
              <div>
                <div style={{ fontFamily: S.fontDisplay, fontSize: "13px", fontWeight: 700, color: "#FAF7F4", letterSpacing: "-0.02em" }}>October 27, 2026</div>
                <div style={{ fontFamily: S.fontSans, fontSize: "12px", color: S.clay, marginTop: "2px" }}>5:30 – 9:00 PM ET</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#E3F643" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <div>
                <div style={{ fontFamily: S.fontDisplay, fontSize: "13px", fontWeight: 700, color: "#FAF7F4", letterSpacing: "-0.02em" }}>The Altman Building</div>
                <div style={{ fontFamily: S.fontSans, fontSize: "12px", color: S.clay, marginTop: "2px" }}>135 W 18th St, New York, NY</div>
                <div style={{ fontFamily: S.fontSans, fontSize: "12px", color: S.clay, marginTop: "2px" }}>Doors Open at 5:00pm</div>
              </div>
            </div>
          </div>
        )}
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
        .rsvp-confetti { position: fixed; top: 50%; left: 50%; width: 0; height: 0; z-index: 1001; pointer-events: none; }
        .rsvp-confetti span { position: absolute; top: 0; left: 0; width: 7px; height: 12px; border-radius: 2px; background: #E3F643; opacity: 0; animation: rsvp-confetti-burst 1.15s cubic-bezier(.16,1,.3,1) both; }
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
          from { opacity: 0; transform: translate(0, 0) rotate(0) scale(.4); }
          18% { opacity: 1; }
          to { opacity: 0; transform: translate(var(--x), var(--y)) rotate(var(--r)) scale(1); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        <input name="firstName" type="text" required placeholder="First Name" aria-label="First Name" defaultValue={user?.firstName} className="rsvp-field" style={inputStyle(false)} />
        <input name="lastName" type="text" required placeholder="Last Name" aria-label="Last Name" defaultValue={user?.lastName} className="rsvp-field" style={inputStyle(false)} />
        <input name="email" type="email" required placeholder="Email Address" aria-label="Email Address" defaultValue={user?.email} className="rsvp-field" style={inputStyle(false)} />
        <input name="phone" type="tel" required placeholder="Phone Number" aria-label="Phone Number" className="rsvp-field" style={inputStyle(false)} />
        <input name="company" type="text" required placeholder="Company" aria-label="Company" defaultValue={user?.company} className="rsvp-field" style={inputStyle(false)} />
        <input name="title" type="text" required placeholder="Title" aria-label="Title" defaultValue={user?.title} className="rsvp-field" style={inputStyle(false)} />
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
