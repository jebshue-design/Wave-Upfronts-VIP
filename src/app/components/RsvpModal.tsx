"use client";

import { useState, useEffect } from "react";
import RsvpForm from "./RsvpForm";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  line: "#2E332E",
  pill: "999px",
  fontMono: '"Space Grotesk", ui-monospace, monospace',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
};

export default function RsvpModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      {/* Floating RSVP button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 999,
          background: S.volt,
          color: S.night,
          border: "none",
          borderRadius: S.pill,
          fontFamily: S.fontMono,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "16px 28px",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(227,246,67,0.35)",
        }}
      >
        RSVP Now
      </button>

      {!open ? null : (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(11, 9, 9, 0.85)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: S.slate,
          border: `1px solid ${S.line}`,
          borderRadius: "12px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Volt top bar */}
        <div style={{ height: "3px", background: S.volt, borderRadius: "12px 12px 0 0" }} />

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: S.clay,
            padding: "4px",
            lineHeight: 1,
            fontSize: "20px",
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ padding: "40px" }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: S.fontMono,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: S.volt,
            marginBottom: "12px",
          }}>
            Wave Upfronts 2026
          </div>

          {/* Heading */}
          <h2 style={{
            fontFamily: S.fontDisplay,
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: S.silver,
            margin: "0 0 8px",
            lineHeight: 1.05,
          }}>
            Join us in New York.
          </h2>

          <p style={{
            fontFamily: S.fontMono,
            fontSize: "13px",
            color: S.clay,
            margin: "0 0 36px",
            lineHeight: 1.6,
          }}>
            Confirm your attendance below. We&apos;ll follow up with event details.
          </p>

          <RsvpForm onSuccess={() => setTimeout(() => setOpen(false), 2500)} />

          <button
            onClick={() => setOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: S.fontMono,
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: S.clay,
              marginTop: "20px",
              padding: 0,
              display: "block",
            }}
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
    )}
    </>
  );
}
