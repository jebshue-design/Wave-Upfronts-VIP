"use client";

import { useActionState } from "react";
import Image from "next/image";
import { login } from "../actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, { error: "" });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0909",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Volt accent line — top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "#E3F643",
        }}
      />


      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          gap: "48px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            src="/assets/wave-primary-lockup-white.svg"
            alt="Wave Sports & Entertainment"
            width={220}
            height={21}
            priority
          />
        </div>

        {/* Form block */}
        <div
          style={{
            border: "1px solid #2E332E",
            background: "#212922",
            padding: "40px",
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                fontFamily: '"Space Grotesk", monospace',
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#E3F643",
                marginBottom: "12px",
              }}
            >
              VIP Access
            </div>
            <h1
              style={{
                fontFamily: '"Zalando Sans Expanded", system-ui, sans-serif',
                fontSize: "28px",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                color: "#FAF7F4",
                margin: 0,
              }}
            >
              Wave Upfronts 2026
            </h1>
            <p
              style={{
                fontFamily: '"Zalando Sans", system-ui, sans-serif',
                fontSize: "15px",
                color: "#94958B",
                marginTop: "12px",
                marginBottom: 0,
                lineHeight: 1.5,
              }}
            >
              Enter your access code to continue.
            </p>
          </div>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="password"
                style={{
                  fontFamily: '"Space Grotesk", monospace',
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#94958B",
                }}
              >
                Access Code
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                placeholder="••••••••••"
                style={{
                  background: "#0B0909",
                  border: state?.error ? "1px solid #FA3842" : "1px solid #3F4640",
                  color: "#FAF7F4",
                  fontFamily: '"Space Grotesk", monospace',
                  fontSize: "15px",
                  letterSpacing: "0.04em",
                  padding: "14px 16px",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 200ms",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#E3F643";
                }}
                onBlur={(e) => {
                  if (!state?.error) e.currentTarget.style.borderColor = "#3F4640";
                }}
              />
              {state?.error && (
                <div
                  style={{
                    fontFamily: '"Space Grotesk", monospace',
                    fontSize: "12px",
                    letterSpacing: "0.04em",
                    color: "#FA3842",
                  }}
                >
                  {state.error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                background: isPending ? "#2A332B" : "#E3F643",
                color: "#0B0909",
                border: "none",
                borderRadius: "999px",
                fontFamily: '"Space Grotesk", monospace',
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "16px 24px",
                cursor: isPending ? "not-allowed" : "pointer",
                transition: "background 200ms",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!isPending) e.currentTarget.style.background = "#f0ff5a";
              }}
              onMouseLeave={(e) => {
                if (!isPending) e.currentTarget.style.background = "#E3F643";
              }}
            >
              {isPending ? "Verifying..." : "Enter"}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p
          style={{
            fontFamily: '"Space Grotesk", monospace',
            fontSize: "11px",
            letterSpacing: "0.04em",
            color: "#4B504A",
            textAlign: "center",
            margin: 0,
          }}
        >
          For access, contact your Wave representative.
        </p>
      </div>

      {/* Volt accent line — bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "#2E332E",
        }}
      />
    </div>
  );
}
