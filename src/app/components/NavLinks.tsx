"use client";

import { useState } from "react";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  clay: "#94958B",
  silver: "#FAF7F4",
  line: "#2E332E",
  fontMono: '"Space Grotesk", ui-monospace, monospace',
};

type Show = { id: string; title: string; category: string; categoryColor: string };

const otherLinks = [
  { label: "RSVP",     href: "#rsvp" },
  { label: "Audience", href: "#audience" },
  { label: "Assets",   href: "#assets" },
  { label: "Contact",  href: "#contact" },
];

const linkStyle = (hovered: boolean): React.CSSProperties => ({
  fontFamily: S.fontMono,
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: hovered ? S.silver : S.clay,
  textDecoration: "none",
  transition: "color 0.15s ease",
  cursor: "pointer",
  background: "none",
  border: "none",
  padding: 0,
});

export default function NavLinks({ shows = [] }: { shows?: Show[] }) {
  const [slateHovered, setSlateHovered] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>

      {/* The Slate — with dropdown */}
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => setSlateHovered(true)}
        onMouseLeave={() => setSlateHovered(false)}
      >
        <a
          href="#slate"
          style={linkStyle(slateHovered)}
        >
          The Slate
        </a>

        {/* Invisible bridge — fills the gap so mouse doesn't leave */}
        {slateHovered && (
          <div style={{ position: "absolute", top: "100%", left: "-20px", right: "-20px", height: "20px" }} />
        )}

        {/* Dropdown */}
        {slateHovered && shows.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 16px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: S.slate,
              border: `1px solid ${S.line}`,
              borderRadius: "10px",
              padding: "8px",
              minWidth: "220px",
              zIndex: 200,
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            }}
          >
            {/* Pointer */}
            <div style={{
              position: "absolute",
              top: "-5px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "10px",
              height: "10px",
              background: S.slate,
              borderTop: `1px solid ${S.line}`,
              borderLeft: `1px solid ${S.line}`,
            }} />

            {shows.map((show) => (
              <button
                key={show.id}
                onClick={() => {
                  setSlateHovered(false);
                  window.dispatchEvent(new CustomEvent("open-show", { detail: { id: show.id } }));
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "background 0.12s ease",
                  background: hoveredLink === show.id ? "rgba(255,255,255,0.05)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseEnter={() => setHoveredLink(show.id)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <div style={{
                  width: "6px", height: "6px",
                  borderRadius: "50%",
                  background: show.categoryColor,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: S.fontMono,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: hoveredLink === show.id ? S.silver : S.clay,
                  transition: "color 0.12s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "180px",
                }}>
                  {show.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Other nav links */}
      {otherLinks.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          style={linkStyle(hoveredLink === href)}
          onMouseEnter={() => setHoveredLink(href)}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {label}
        </a>
      ))}

      <div style={{ width: "1px", height: "16px", background: S.line }} />
    </div>
  );
}
