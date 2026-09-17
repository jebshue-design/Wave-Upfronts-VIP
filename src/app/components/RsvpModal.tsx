"use client";

import { useEffect, useRef, useState } from "react";
import RsvpForm from "./RsvpForm";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  line: "#2E332E",
  pill: "999px",
  fontMono: '"Zalando Sans", system-ui, sans-serif',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
};

type UserPrefill = { firstName: string; lastName: string; email: string; company: string; title: string };

export default function RsvpModal({ user, existingRsvpType, onRsvpComplete }: { user?: UserPrefill; existingRsvpType?: string | null; onRsvpComplete?: (rsvpType: string) => void } = {}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const openModal = (first = false) => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setClosing(false);
      setConfirmed(false);
      setIsFirstOpen(first);
      setOpen(true);
    };
    const handleOpenRsvp = () => openModal(false);
    window.addEventListener("open-rsvp", handleOpenRsvp);

    // Auto-open once per session after the carousel has settled (skip if already RSVPed)
    if (!sessionStorage.getItem("rsvp-shown") && !existingRsvpType) {
      const t = setTimeout(() => {
        sessionStorage.setItem("rsvp-shown", "1");
        openModal(true);
      }, 1400);
      return () => {
        clearTimeout(t);
        window.removeEventListener("open-rsvp", handleOpenRsvp);
        if (closeTimer.current) clearTimeout(closeTimer.current);
      };
    }

    return () => {
      window.removeEventListener("open-rsvp", handleOpenRsvp);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const closeModal = () => {
    setClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 620);
  };

  return (
    <>
      <style>{`
        @keyframes rsvp-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rsvp-panel-in {
          from { opacity: 0; transform: translateY(42px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rsvp-overlay { animation: rsvp-overlay-in .3s ease-out both; }
        .rsvp-panel { animation: rsvp-panel-in .62s cubic-bezier(.16,1,.3,1) both; }
        @keyframes rsvp-overlay-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes rsvp-panel-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(42px) scale(.98); }
        }
        .rsvp-overlay.is-closing { animation: rsvp-overlay-out .62s cubic-bezier(.7,0,.84,0) both; }
        .rsvp-panel.is-closing { animation: rsvp-panel-out .62s cubic-bezier(.7,0,.84,0) both; }
      `}</style>
      {!open ? null : (
    <div
      className={`rsvp-overlay${closing ? " is-closing" : ""}`}
      onClick={closeModal}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(11, 9, 9, 0.48)",
        backdropFilter: "blur(18px) saturate(130%)",
        WebkitBackdropFilter: "blur(18px) saturate(130%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className={`rsvp-panel${closing ? " is-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(33, 41, 34, 0.35)",
          border: "1px solid rgba(250,247,244,.28)",
          backdropFilter: "blur(22px) saturate(125%)",
          WebkitBackdropFilter: "blur(22px) saturate(125%)",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(250,247,244,.12)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            border: "none",
            cursor: "pointer",
            color: S.clay,
            padding: 0,
            lineHeight: 1,
            fontSize: "18px",
          }}
          aria-label="Close"
        >
          ✕
        </button>

          <div style={{ padding: "44px" }}>
          {!confirmed && <div style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: "clamp(19px, 2.5vw, 25px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: S.volt,
            marginBottom: "12px",
            textAlign: "center",
          }}>
            10.27.2026
          </div>}
          {!confirmed && <h2 style={{
            fontFamily: S.fontDisplay,
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: S.silver,
            margin: "0 0 8px",
            lineHeight: 1.05,
            textAlign: "center",
          }}>
            {isFirstOpen && user?.firstName ? `Welcome, ${user.firstName}` : "Join us in New York"}
          </h2>}

          {!confirmed && <p style={{
            fontFamily: '"Zalando Sans", system-ui, sans-serif',
            fontSize: "13px",
            color: S.clay,
            margin: "0 auto 36px",
            lineHeight: 1.6,
            textAlign: "center",
          }}>
            Confirm your attendance below. We&apos;ll follow up with event details.
          </p>}

          <RsvpForm onSuccess={() => setConfirmed(true)} onRsvpComplete={onRsvpComplete} user={user} existingRsvpType={existingRsvpType} />
        </div>
      </div>
    </div>
    )}
    </>
  );
}
