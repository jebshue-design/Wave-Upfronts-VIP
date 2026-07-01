"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Phase = "logo" | "reveal" | "open" | "tagline";

const S = {
  night: "#0B0909",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  fontMono: '"Space Grotesk", ui-monospace, monospace',
  fontDisplay: '"Zalando Sans Expanded", "Helvetica Neue Condensed", system-ui, sans-serif',
  pill: "999px",
};

export default function IntroOverlay({ videoPath }: { videoPath: string }) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("logo");
  const [fading, setFading] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("wave-intro-seen")) {
      setVisible(true);
      // logo → reveal → open
      const t1 = setTimeout(() => setPhase("reveal"), 1600);
      const t2 = setTimeout(() => setPhase("open"),   2450);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("wave-intro-seen", "1");
    }, 750);
  };

  const onVideoEnded = () => {
    setPhase("tagline");
    setTimeout(() => {
      setPhase("reveal");
      setTimeout(() => setPhase("open"), 850);
      setTimeout(dismiss, 1800);
    }, 2000);
  };

  const unmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      setMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !videoRef.current.muted;
      videoRef.current.muted = next;
      videoRef.current.volume = next ? 0 : 1;
      setMuted(next);
    }
  };

  if (!visible) return null;

  const curtainsOpen  = phase === "reveal" || phase === "open";
  const uiVisible     = phase === "open";
  const logoVisible   = phase === "logo";
  const seamVisible   = phase === "reveal";
  const taglineVisible = phase === "tagline";

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
      {/* Keyframes */}
      <style>{`
        @keyframes intro-logo-rise {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes intro-tag-rise {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 10px)); }
          to   { opacity: 0.45; transform: translate(-50%, -50%); }
        }
        @keyframes intro-line-grow {
          from { transform: translate(-50%, -50%) scaleX(0); }
          to   { transform: translate(-50%, -50%) scaleX(1); }
        }
        @keyframes tagline-rise {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes unmute-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(227,246,67,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(227,246,67,0); }
        }
        @keyframes intro-seam-flash {
          0%   { opacity: 0; box-shadow: none; }
          30%  { opacity: 1; box-shadow: 0 0 24px 4px rgba(227,246,67,0.6); }
          100% { opacity: 1; box-shadow: 0 0 8px 1px rgba(227,246,67,0.2); }
        }
      `}</style>

      {/* ── VIDEO ─────────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, background: S.night }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={onVideoEnded}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        >
          <source src={videoPath} />
        </video>
        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(11,9,9,0.45) 100%)",
        }} />
      </div>

      {/* ── POST-VIDEO TAGLINE ────────────────────── */}
      {taglineVisible && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          zIndex: 8,
          textAlign: "center",
          pointerEvents: "none",
          animation: "tagline-rise 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        }}>
          <div style={{
            fontFamily: S.fontDisplay,
            fontSize: "clamp(48px, 8vw, 120px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
            color: S.silver,
            whiteSpace: "nowrap",
          }}>
            On Your<br />
            <span style={{ color: S.volt }}>Frequency</span>
          </div>
        </div>
      )}

      {/* ── VOLT TOP LINE (always) ─────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "2px", background: S.volt, zIndex: 10,
      }} />

      {/* ── LEFT CURTAIN ──────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: "50%", height: "100%",
        background: S.night,
        zIndex: 5,
        transform: curtainsOpen ? "translateX(-100%)" : "translateX(0)",
        transition: curtainsOpen
          ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)"
          : "none",
      }} />

      {/* ── RIGHT CURTAIN ─────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "50%", height: "100%",
        background: S.night,
        zIndex: 5,
        transform: curtainsOpen ? "translateX(100%)" : "translateX(0)",
        transition: curtainsOpen
          ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)"
          : "none",
      }} />

      {/* ── VOLT SEAM (flashes at the split moment) ── */}
      {seamVisible && (
        <div style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: "calc(50% - 1px)",
          width: "2px",
          background: `linear-gradient(to bottom, transparent, ${S.volt} 15%, ${S.volt} 85%, transparent)`,
          zIndex: 6,
          animation: "intro-seam-flash 0.85s ease both",
        }} />
      )}

      {/* ── CENTERED LOGO (logo phase) ────────────── */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        zIndex: 7,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0",
        pointerEvents: "none",
        opacity: logoVisible ? 1 : 0,
        transition: logoVisible ? "none" : "opacity 0.35s ease",
      }}>
        {/* Logo */}
        <div style={{
          position: "absolute",
          top: "-11px", left: "50%",
          animation: "intro-logo-rise 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both",
        }}>
          <Image
            src="/assets/wave-primary-lockup-white.svg"
            alt="Wave Sports & Entertainment"
            width={260}
            height={25}
            priority
          />
        </div>

        {/* Volt underline */}
        <div style={{
          position: "absolute",
          top: "26px", left: "50%",
          height: "2px",
          width: "260px",
          background: S.volt,
          transformOrigin: "center",
          animation: "intro-line-grow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.55s both",
        }} />

        {/* Tag */}
        <div style={{
          position: "absolute",
          top: "52px", left: "50%",
          fontFamily: S.fontMono,
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: S.clay,
          whiteSpace: "nowrap",
          animation: "intro-tag-rise 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s both",
        }}>
          Upfronts 2026 · VIP Access
        </div>
      </div>

      {/* ── CORNER LOGO (open phase) ──────────────── */}
      <div style={{
        position: "absolute", top: "24px", left: "40px",
        zIndex: 10,
        opacity: uiVisible ? 1 : 0,
        transition: "opacity 0.5s ease 0.3s",
        pointerEvents: "none",
      }}>
        <Image
          src="/assets/wave-primary-lockup-white.svg"
          alt="Wave Sports & Entertainment"
          width={140}
          height={13}
        />
      </div>

      {/* ── SKIP BUTTON ───────────────────────────── */}
      <div style={{
        position: "absolute", top: "18px", right: "40px",
        zIndex: 10,
        opacity: uiVisible ? 1 : 0,
        transition: "opacity 0.5s ease 0.35s",
        pointerEvents: uiVisible ? "auto" : "none",
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
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = S.volt;
            e.currentTarget.style.background = "rgba(227,246,67,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(227,246,67,0.35)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          Skip Intro
        </button>
      </div>

      {/* ── UNMUTE BADGE (center, prominent, shown when muted) ── */}
      {uiVisible && muted && (
        <button
          onClick={unmute}
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "rgba(11,9,9,0.85)",
            border: `1px solid ${S.volt}`,
            borderRadius: S.pill,
            color: S.volt,
            fontFamily: S.fontMono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "12px 28px",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "unmute-pulse 2s ease-in-out infinite",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          Click to unmute
        </button>
      )}

      {/* ── MUTE TOGGLE (corner, shown after unmuted) ── */}
      {uiVisible && !muted && (
        <div style={{
          position: "absolute", bottom: "28px", right: "40px",
          zIndex: 10,
        }}>
          <button
            onClick={toggleMute}
            style={{
              background: "rgba(11,9,9,0.7)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: S.pill,
              color: S.silver,
              fontFamily: S.fontMono,
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "8px 16px",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
          >
            Mute
          </button>
        </div>
      )}

      {/* ── BOTTOM LABEL ──────────────────────────── */}
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
        opacity: uiVisible ? 1 : 0,
        transition: "opacity 0.5s ease 0.4s",
      }}>
        VIP Access · Confidential · Wave Upfronts 2026
      </div>
    </div>
  );
}
