"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: "" });

  const pillStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "min(100%, 286px)",
    height: "31px",
    padding: "0 8px 0 16px",
    border: state?.error ? "1px solid #ff6b6b" : "1px solid rgba(255,255,255,0.82)",
    borderRadius: "999px",
    transition: "border-color 180ms ease",
  };

  const inputStyle: React.CSSProperties = {
    minWidth: 0,
    flex: 1,
    border: 0,
    outline: 0,
    background: "transparent",
    color: "#ffffff",
    padding: 0,
    fontFamily: '"Zalando Sans Expanded", sans-serif',
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1,
  };

  return (
    <main style={{ minHeight: "100vh", background: "#000000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <style>{`
        @keyframes gate-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gate-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-6px); }
        }
        .gate-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: gate-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .gate-content.is-leaving {
          animation: gate-out 0.18s ease-out both;
        }
        input::placeholder { color: rgba(255,255,255,0.38); }
      `}</style>

      <div className={`gate-content${isPending ? " is-leaving" : ""}`}>

        {/* Logo */}
        <img
          src="/assets/Wave Logo.svg"
          alt="Wave Sports & Entertainment"
          style={{ width: "121px", height: "auto", marginBottom: "52px" }}
        />

        {/* Headline */}
        <p style={{ margin: "0 0 10px", fontFamily: '"Zalando Sans Expanded", sans-serif', fontSize: "10px", fontWeight: 700, letterSpacing: "-0.025em", textTransform: "uppercase", color: "rgba(244,245,240,0.4)", textAlign: "center" }}>
          VIP Access
        </p>
        <h1 style={{ margin: "0 0 40px", fontFamily: '"Zalando Sans Expanded", sans-serif', fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 0.92, color: "#f4f5f0", textAlign: "center" }}>
          Wave Upfronts 2027
        </h1>

        <form action={formAction} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          {/* Email pill */}
          <div style={{ ...pillStyle, border: "1px solid rgba(255,255,255,0.82)" }}>
            <label htmlFor="login-email" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="ENTER YOUR EMAIL"
              disabled={isPending}
              style={inputStyle}
            />
          </div>

          {/* Password pill with arrow submit */}
          <div style={{ ...pillStyle, border: state?.error ? "1px solid #ff6b6b" : "1px solid rgba(255,255,255,0.82)" }}>
            <label htmlFor="login-password" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Event password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="EVENT PASSWORD"
              disabled={isPending}
              style={inputStyle}
            />
            <button
              type="submit"
              aria-label="Submit"
              disabled={isPending}
              style={{ display: "grid", placeItems: "center", flexShrink: 0, width: "24px", height: "24px", padding: 0, border: 0, background: "transparent", cursor: isPending ? "wait" : "pointer" }}
            >
              <img src="/assets/site-arrow.svg" alt="" width="18" height="13" />
            </button>
          </div>
        </form>

        {state?.error && (
          <p style={{ margin: "14px 0 0", color: "#ffb0b0", fontFamily: '"Zalando Sans", sans-serif', fontSize: "11px", letterSpacing: "-0.025em" }}>
            {state.error}
          </p>
        )}

      </div>

      {/* Footer */}
      <p style={{ position: "fixed", bottom: "20px", fontFamily: '"Zalando Sans", sans-serif', fontSize: "11px", color: "rgba(244,245,240,0.28)", letterSpacing: "-0.025em" }}>
        © 2026 Wave Sports &amp; Entertainment
      </p>
    </main>
  );
}
