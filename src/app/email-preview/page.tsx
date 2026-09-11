// Local dev only — preview the RSVP confirmation email

export default function EmailPreview() {
  const name = "Sarah";
  const aeEmail = "tom.defina@wave.tv";
  const aeContact = "Tom Defina";

  return (
    <div style={{ background: "#161616", minHeight: "100vh", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>

      {/* Meta bar */}
      <div style={{ width: "100%", maxWidth: "620px", background: "#111", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#888", display: "flex", flexDirection: "column", gap: "4px" }}>
        <div><span style={{ color: "#444" }}>From: </span><span style={{ color: "#aaa" }}>Wave Upfronts &lt;upfronts@wave.tv&gt;</span></div>
        <div><span style={{ color: "#444" }}>To: </span><span style={{ color: "#aaa" }}>sarah.chen@omnicommedia.com</span></div>
        <div><span style={{ color: "#444" }}>Subject: </span><span style={{ color: "#aaa" }}>You&apos;re confirmed — Wave Upfronts 2027</span></div>
      </div>

      {/* Email */}
      <div style={{ fontFamily: "Arial, Helvetica, sans-serif", width: "100%", maxWidth: "680px", background: "#0B0909", borderRadius: "12px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>

        {/* Volt top bar — thicker for impact */}
        <div style={{ background: "#E3F643", height: "8px" }} />

        {/* Header */}
        <div style={{ padding: "32px 48px 28px", borderBottom: "1px solid #1a1a1a" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/wave-primary-lockup-white.svg" alt="Wave Sports & Entertainment" style={{ height: "30px", display: "block" }} />
        </div>

        {/* Hero */}
        <div style={{ padding: "44px 48px 36px" }}>
          <div style={{ display: "inline-block", background: "rgba(227,246,67,0.12)", border: "1px solid rgba(227,246,67,0.25)", borderRadius: "999px", padding: "4px 12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#E3F643" }}>
              You&apos;re confirmed
            </span>
          </div>
          <h1 style={{ margin: "0 0 20px", fontSize: "36px", fontWeight: 700, color: "#FAF7F4", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Wave Upfronts 2027
          </h1>
          <p style={{ margin: 0, fontSize: "15px", color: "#94958B", lineHeight: 1.75 }}>
            Hi <strong style={{ color: "#FAF7F4" }}>{name}</strong>, we&apos;ve got you on the list. We&apos;ll be in touch with full event details — including schedule, speakers, and everything else — as we get closer to the date.
          </p>
        </div>

        {/* Details card */}
        <div style={{ padding: "0 48px 40px" }}>
          <div style={{ background: "rgba(227,246,67,0.04)", border: "1px solid rgba(227,246,67,0.14)", borderRadius: "10px", overflow: "hidden" }}>

            {/* Date */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(227,246,67,0.08)", display: "flex", alignItems: "baseline", gap: "20px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3F4640", minWidth: "72px", flexShrink: 0 }}>Date</span>
              <span style={{ fontSize: "15px", color: "#E3F643", fontWeight: 700 }}>October 27, 2026</span>
            </div>

            {/* Location */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(227,246,67,0.08)", display: "flex", alignItems: "baseline", gap: "20px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3F4640", minWidth: "72px", flexShrink: 0 }}>Location</span>
              <span style={{ fontSize: "14px", color: "#FAF7F4", lineHeight: 1.4 }}>135 West 18th Street<br />New York, NY 10011</span>
            </div>

            {/* Time */}
            <div style={{ padding: "18px 24px", display: "flex", alignItems: "baseline", gap: "20px" }}>
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3F4640", minWidth: "72px", flexShrink: 0 }}>Time</span>
              <span style={{ fontSize: "14px", color: "#FAF7F4" }}>5:00 PM ET</span>
            </div>

          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "0 48px 44px" }}>
          <a
            href="https://waveupfronts2027.com"
            style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0B0909", background: "#E3F643", textDecoration: "none", padding: "13px 28px", borderRadius: "999px" }}
          >
            Explore the Lineup →
          </a>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 48px 32px", borderTop: "1px solid #1a1a1a" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#3F4640", lineHeight: 1.7 }}>
            Reach out to{" "}
            <a href={`mailto:${aeEmail}`} style={{ color: "#6b6c62", textDecoration: "none" }}>
              {aeContact}
            </a>
            {" "}at{" "}
            <a href={`mailto:${aeEmail}`} style={{ color: "#E3F643", textDecoration: "none" }}>
              {aeEmail}
            </a>
          </p>
        </div>

      </div>

      <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#333", marginTop: "8px" }}>
        localhost preview · edit src/app/email-preview/page.tsx
      </p>
    </div>
  );
}
