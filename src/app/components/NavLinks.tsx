"use client";

const S = {
  clay: "#94958B",
  silver: "#FAF7F4",
  line: "#2E332E",
  fontMono: '"Space Grotesk", ui-monospace, monospace',
};

const links = [
  { label: "The Slate", href: "#slate" },
  { label: "Audience",  href: "#audience" },
  { label: "Assets",    href: "#assets" },
  { label: "Contact",   href: "#contact" },
];

export default function NavLinks() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      {links.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          style={{
            fontFamily: S.fontMono,
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: S.clay,
            textDecoration: "none",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = S.silver)}
          onMouseLeave={(e) => (e.currentTarget.style.color = S.clay)}
        >
          {label}
        </a>
      ))}
      <div style={{ width: "1px", height: "16px", background: S.line }} />
    </div>
  );
}
