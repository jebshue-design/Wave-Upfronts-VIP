"use client";

import { useState, useEffect } from "react";

type Phase = "text" | "curtains" | "done";

const S = {
  night: "#0B0909",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  fontMono: '"Space Grotesk", ui-monospace, monospace',
  fontDisplay: '"Zalando Sans Expanded", "Helvetica Neue Condensed", system-ui, sans-serif',
  pill: "999px",
};


export default function TextIntro({ name }: { name?: string | null }) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("text");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("wave-intro-seen");
    if (name || !alreadySeen) {
      setVisible(true);
      const t1 = setTimeout(() => setPhase("curtains"), 1800);
      const t2 = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("wave-intro-seen", "1");
        }, 750);
      }, 2900);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [name]);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("wave-intro-seen", "1");
    }, 750);
  };

  if (!visible) return null;

  const curtainsOpen = phase === "curtains" || phase === "done";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.75s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes headline-rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tag-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

      `}</style>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: S.night }} />

      {/* Volt top line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: S.volt, zIndex: 10 }} />

      {/* Top curtain */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "50%",
        background: S.night, zIndex: 5,
        transform: curtainsOpen ? "translateY(-100%)" : "translateY(0)",
        transition: curtainsOpen ? "transform 0.92s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
      }} />

      {/* Bottom curtain */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        width: "100%", height: "50%",
        background: S.night, zIndex: 5,
        transform: curtainsOpen ? "translateY(100%)" : "translateY(0)",
        transition: curtainsOpen ? "transform 0.92s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
      }} />


      {/* Centered headline */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 7,
        textAlign: "center",
        pointerEvents: "none",
      }}>
        {name ? (
          <>
            <div style={{
              fontFamily: S.fontMono,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: S.volt,
              marginBottom: "20px",
              animation: "tag-rise 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both",
            }}>
              Wave Upfronts 2026
            </div>
            <div style={{
              fontFamily: S.fontDisplay,
              fontSize: "clamp(48px, 8vw, 120px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: S.silver,
              animation: "headline-rise 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both",
              whiteSpace: "nowrap",
            }}>
              Welcome,<br />
              <span style={{ color: S.volt }}>{name.split(" ")[0]}</span>
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontFamily: S.fontDisplay,
              fontSize: "clamp(48px, 8vw, 120px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: S.silver,
              animation: "headline-rise 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both",
              whiteSpace: "nowrap",
            }}>
              On Your<br />
              <span style={{ color: S.volt }}>Frequency</span>
            </div>
            <div style={{
              fontFamily: S.fontMono,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: S.clay,
              marginTop: "24px",
              animation: "tag-rise 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.9s both",
            }}>
              Upfronts 2026 · VIP Access
            </div>
          </>
        )}
      </div>

      {/* Skip button */}
      <div style={{
        position: "absolute", top: "18px", right: "40px",
        zIndex: 10,
        opacity: phase === "text" ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: phase === "text" ? "auto" : "none",
      }}>
        <button
          onClick={dismiss}
          style={{
            background: "transparent",
            border: "1px solid rgba(227,246,67,0.35)",
            borderRadius: S.pill,
            color: S.volt,
            fontFamily: S.fontMono,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "8px 20px",
            cursor: "pointer",
          }}
        >
          Skip
        </button>
      </div>

      {/* Bottom label */}
      <div style={{
        position: "absolute", bottom: "28px", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        fontFamily: S.fontMono,
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(148,149,139,0.35)",
        whiteSpace: "nowrap",
      }}>
        VIP Access · Confidential · Wave Upfronts 2026
      </div>
    </div>
  );
}
