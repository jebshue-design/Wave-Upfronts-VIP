"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { trackEvent } from "@/app/actions";

const S = {
  night: "#0B0909",
  slate: "#212922",
  volt: "#E3F643",
  silver: "#FAF7F4",
  clay: "#94958B",
  line: "#2E332E",
  lineStrong: "#3F4640",
  pill: "999px",
  fontMono: '"Space Grotesk", ui-monospace, monospace',
  fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
  fontSans: '"Space Grotesk", system-ui, sans-serif',
};

type AudienceData = {
  followers: string;
  monthlyViews: string;
  monthlyDownloads: string;
  genderSkew: string;
  persona: string;
  quickHits: string[];
  guestExamples: string[];
  ages: { label: string; pct: number }[];
  hhi100k: string;
  usShare: string;
  topGeos: string[];
  devices: { label: string; pct: number }[];
  avgWatchTime: string;
  viewerBehavior: { new: number; casual: number; regular: number };
  interests: string[];
  audienceOverlap: string[];
};

type Show = {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  tagline: string;
  description: string;
  specs: string;
  season: string;
  demo: string;
  videoPath: string | null;
  oneSheetPath: string | null;
  thumbnailPath: string;
  youtubeUrl: string | null;
  audioUrl: string | null;
  audience?: AudienceData | null;
};

function parseGenderSplit(skew: string): { female: number; male: number } {
  const slashMatch = skew.match(/(\d+)\/(\d+)\s+(Male|Female)/i);
  if (slashMatch) {
    const a = parseInt(slashMatch[1]);
    const b = parseInt(slashMatch[2]);
    const gender = slashMatch[3].toLowerCase();
    return gender === "female" ? { female: a, male: b } : { female: b, male: a };
  }
  const pctMatch = skew.match(/(\d+)%?\s+(Male|Female)/i);
  if (pctMatch) {
    const pct = parseInt(pctMatch[1]);
    const gender = pctMatch[2].toLowerCase();
    return gender === "female" ? { female: pct, male: 100 - pct } : { female: 100 - pct, male: pct };
  }
  return { female: 50, male: 50 };
}

export default function ShowModalManager({ shows }: { shows: Show[] }) {
  const [activeShow, setActiveShow] = useState<Show | null>(null);
  const openTimeRef = useRef<number | null>(null);
  const activeShowRef = useRef<Show | null>(null);

  const logDuration = (show: Show) => {
    if (openTimeRef.current === null) return;
    const seconds = Math.round((Date.now() - openTimeRef.current) / 1000);
    if (seconds > 0) {
      trackEvent("show_duration", { show_id: show.id, show_title: show.title, duration_seconds: String(seconds) });
    }
    openTimeRef.current = null;
  };

  const handleClose = () => {
    if (activeShowRef.current) logDuration(activeShowRef.current);
    activeShowRef.current = null;
    setActiveShow(null);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail.id;
      const show = shows.find((s) => s.id === id) ?? null;
      if (activeShowRef.current) logDuration(activeShowRef.current);
      activeShowRef.current = show;
      openTimeRef.current = show ? Date.now() : null;
      setActiveShow(show);
      if (show) {
        trackEvent("show_view", { show_id: show.id, show_title: show.title });
      }
    };
    window.addEventListener("open-show", handler);
    return () => window.removeEventListener("open-show", handler);
  }, [shows]);

  if (!activeShow) return null;

  const aud = activeShow.audience ?? null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "rgba(11,9,9,0.85)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: S.slate,
          border: `1px solid ${S.line}`,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "960px",
          height: "88vh",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left — poster (stays fixed while right scrolls) */}
        <div style={{ position: "relative", background: "#161A16", overflow: "hidden" }}>
          {activeShow.thumbnailPath && (
            <Image src={activeShow.thumbnailPath} alt={activeShow.title} fill unoptimized style={{ objectFit: "cover" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 55%, " + S.slate + ")" }} />
          <div style={{ position: "absolute", top: "16px", left: "16px" }}>
            <span style={{
              fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: S.night, background: activeShow.categoryColor,
              padding: "4px 10px", borderRadius: S.pill,
            }}>{activeShow.category}</span>
          </div>
        </div>

        {/* Right — info panel (scrolls independently) */}
        <div style={{ overflowY: "auto", padding: "32px 32px 32px 28px", display: "flex", flexDirection: "column" }}>

          {/* Close button */}
          <button
            onClick={handleClose}
            style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", cursor: "pointer", color: S.clay, fontSize: "20px", lineHeight: 1, padding: "4px" }}
          >✕</button>

          {/* Title + tagline */}
          <h2 style={{ fontFamily: S.fontDisplay, fontSize: "clamp(20px, 2.2vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver, margin: "0 40px 8px 0", lineHeight: 1.05 }}>
            {activeShow.title}
          </h2>
          <p style={{ fontFamily: S.fontSans, fontSize: "13px", color: S.clay, margin: "0 0 20px", lineHeight: 1.5 }}>
            {activeShow.tagline}
          </p>

          {/* Key metrics — only if audience data exists */}
          {aud && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Total Followers", value: aud.followers },
                { label: "Monthly Views", value: aud.monthlyViews },
                { label: "Mnthly Downloads", value: aud.monthlyDownloads },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "10px", padding: "12px 14px" }}>
                  <div style={{ fontFamily: S.fontDisplay, fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: S.volt, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontFamily: S.fontMono, fontSize: "8px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginTop: "5px" }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: "1px", background: S.line, marginBottom: "20px" }} />

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 16px", marginBottom: "18px" }}>
            {([
              { label: "Target Demo", value: activeShow.demo },
              { label: "Format", value: activeShow.specs },
              { label: "Season", value: activeShow.season },
            ] as { label: string; value: string }[]).map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: S.clay, marginBottom: "5px" }}>{label}</div>
                <div style={{ fontFamily: S.fontSans, fontSize: "13px", color: S.silver, lineHeight: 1.3 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <p style={{ fontFamily: S.fontSans, fontSize: "13px", lineHeight: 1.7, color: S.clay, margin: "0 0 20px" }}>
            {activeShow.description}
          </p>

          {/* ── AUDIENCE DATA ─────────────────────────────── */}
          {aud && (
            <>
              <div style={{ height: "1px", background: S.line, marginBottom: "20px" }} />

              {/* PERSONA */}
              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.volt, marginBottom: "10px" }}>Persona</div>
              <div style={{ borderLeft: `2px solid ${S.volt}`, paddingLeft: "12px", marginBottom: "14px" }}>
                <p style={{ fontFamily: S.fontSans, fontSize: "13px", lineHeight: 1.6, color: S.silver, margin: 0, fontStyle: "italic" }}>
                  {aud.persona}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                {aud.quickHits.map((tag) => (
                  <span key={tag} style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", color: S.clay, background: S.night, border: `1px solid ${S.line}`, borderRadius: S.pill, padding: "4px 10px" }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ height: "1px", background: S.line, marginBottom: "20px" }} />

              {/* DEMOGRAPHICS */}
              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.volt, marginBottom: "14px" }}>Demographics</div>

              {/* Gender */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Gender</div>
                {(() => {
                  const { female, male } = parseGenderSplit(aud.genderSkew);
                  const total = female + male || 100;
                  const femalePct = Math.round((female / total) * 100);
                  return (
                    <>
                      <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${femalePct}%`, background: "#FF6FAE" }} />
                        <div style={{ flex: 1, background: S.volt }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                        <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: "#FF6FAE", fontWeight: 600 }}>{female}% Female</span>
                        <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.volt, fontWeight: 600 }}>{male}% Male</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Age breakdown */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Age Breakdown</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {aud.ages.map(({ label, pct }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.clay, width: "40px", flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: "4px", background: S.line, borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: S.volt, borderRadius: "2px" }} />
                      </div>
                      <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.silver, width: "36px", flexShrink: 0, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: "1px", background: S.line, marginBottom: "20px" }} />

              {/* REACH */}
              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.volt, marginBottom: "14px" }}>Reach</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                {[
                  { label: "HHI $100K+", value: aud.hhi100k },
                  { label: "US Audience Share", value: aud.usShare },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "10px", padding: "14px 16px" }}>
                    <div style={{ fontFamily: S.fontDisplay, fontSize: "22px", fontWeight: 700, color: S.volt, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginTop: "6px" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Top Markets */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Top Markets</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {aud.topGeos.map((geo) => (
                    <span key={geo} style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", color: S.clay, background: S.night, border: `1px solid ${S.line}`, borderRadius: S.pill, padding: "4px 10px" }}>
                      {geo}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ height: "1px", background: S.line, marginBottom: "20px" }} />

              {/* CONSUMPTION */}
              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.volt, marginBottom: "14px" }}>Consumption</div>

              {/* Devices */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Device Breakdown</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {aud.devices.map(({ label, pct }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.clay, width: "62px", flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: "4px", background: S.line, borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: S.volt, borderRadius: "2px" }} />
                      </div>
                      <span style={{ fontFamily: S.fontMono, fontSize: "10px", color: S.silver, width: "36px", flexShrink: 0, textAlign: "right" }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avg Watch Time */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "6px" }}>Avg Watch / Listen Time</div>
                <div style={{ fontFamily: S.fontSans, fontSize: "13px", color: S.silver }}>{aud.avgWatchTime}</div>
              </div>

              {/* Viewer Behavior */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Viewer Behavior</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "New", value: aud.viewerBehavior.new },
                    { label: "Casual", value: aud.viewerBehavior.casual },
                    { label: "Regular", value: aud.viewerBehavior.regular },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: S.night, border: `1px solid ${S.line}`, borderRadius: "8px", padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontFamily: S.fontDisplay, fontSize: "18px", fontWeight: 700, color: value > 0 ? S.volt : S.lineStrong, lineHeight: 1 }}>
                        {value > 0 ? `${value}%` : "—"}
                      </div>
                      <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginTop: "4px" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: "1px", background: S.line, marginBottom: "20px" }} />

              {/* AFFINITIES */}
              <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: S.volt, marginBottom: "14px" }}>Affinities</div>

              {/* Interests */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Top Interests</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {aud.interests.map((interest) => (
                    <span key={interest} style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", color: S.silver, background: S.night, border: `1px solid ${S.lineStrong}`, borderRadius: S.pill, padding: "4px 10px" }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notable Guests */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Notable Guests</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {aud.guestExamples.map((guest) => (
                    <span key={guest} style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", color: S.volt, background: "rgba(227,246,67,0.08)", border: "1px solid rgba(227,246,67,0.25)", borderRadius: S.pill, padding: "4px 10px" }}>
                      {guest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Audience Overlap */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.clay, marginBottom: "8px" }}>Audience Overlap</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {aud.audienceOverlap.map((show) => (
                    <span key={show} style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", color: S.clay, background: S.night, border: `1px solid ${S.line}`, borderRadius: S.pill, padding: "4px 10px" }}>
                      {show}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "auto", paddingTop: "20px", borderTop: `1px solid ${S.line}` }}>
            {activeShow.videoPath ? (
              <a href={activeShow.videoPath} onClick={() => trackEvent("show_sizzle", { show_id: activeShow.id, show_title: activeShow.title })}
                style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.night, background: S.volt, textDecoration: "none", padding: "12px 22px", borderRadius: S.pill, flexShrink: 0 }}>▶ Sizzle Reel</a>
            ) : (
              <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.lineStrong, border: `1px solid ${S.line}`, padding: "12px 22px", borderRadius: S.pill }}>Reel Pending</span>
            )}
            {activeShow.oneSheetPath ? (
              <a href={activeShow.oneSheetPath} download onClick={() => trackEvent("show_onesheet", { show_id: activeShow.id, show_title: activeShow.title })}
                style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.volt, textDecoration: "none", border: `1px solid ${S.volt}`, padding: "12px 22px", borderRadius: S.pill }}>One-Sheet</a>
            ) : (
              <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: S.lineStrong, border: `1px solid ${S.line}`, padding: "12px 22px", borderRadius: S.pill }}>Sheet Pending</span>
            )}
            {activeShow.youtubeUrl && (
              <a href={activeShow.youtubeUrl} target="_blank" rel="noopener noreferrer" title="YouTube"
                onClick={() => trackEvent("show_youtube", { show_id: activeShow.id, show_title: activeShow.title })}
                style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #2E332E", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M15.665 1.879A2.007 2.007 0 0 0 14.253.46C13.01.12 8 .12 8 .12s-5.01 0-6.253.34A2.007 2.007 0 0 0 .335 1.88C0 3.13 0 5.74 0 5.74s0 2.61.335 3.861a2.007 2.007 0 0 0 1.412 1.419C2.99 11.36 8 11.36 8 11.36s5.01 0 6.253-.34a2.007 2.007 0 0 0 1.412-1.419C16 8.35 16 5.74 16 5.74s0-2.61-.335-3.861z" fill="#FF0000"/><path d="M6.4 8.2l4.16-2.46L6.4 3.28v4.92z" fill="white"/></svg>
              </a>
            )}
            {activeShow.audioUrl && (
              <a href={activeShow.audioUrl} target="_blank" rel="noopener noreferrer" title="Spotify"
                onClick={() => trackEvent("show_spotify", { show_id: activeShow.id, show_title: activeShow.title })}
                style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #2E332E", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1DB954"/><path d="M17.25 16.5c-.19 0-.37-.06-.52-.18-1.57-1.05-3.54-1.6-5.73-1.6-1.19 0-2.38.16-3.5.47-.2.06-.42.03-.6-.08a.75.75 0 0 1-.33-.52.77.77 0 0 1 .53-.88c1.27-.36 2.62-.54 3.9-.54 2.47 0 4.72.63 6.51 1.83.28.19.4.55.29.86a.77.77 0 0 1-.55.64zm1.42-3.25a.93.93 0 0 1-.64-.24c-1.86-1.24-4.2-1.9-6.78-1.9-1.38 0-2.74.2-4.01.6a.93.93 0 0 1-1.16-.62.94.94 0 0 1 .62-1.17 15.1 15.1 0 0 1 4.55-.69c2.9 0 5.56.75 7.69 2.17.42.28.54.85.26 1.27a.93.93 0 0 1-.53.58zm1.6-3.6a1.1 1.1 0 0 1-.6-.18C17.53 7.85 14.87 7.06 12 7.06c-1.66 0-3.32.26-4.93.77a1.1 1.1 0 0 1-1.39-.72 1.1 1.1 0 0 1 .72-1.39A17.3 17.3 0 0 1 12 4.87c3.18 0 6.14.88 8.58 2.53a1.1 1.1 0 0 1-.31 1.96 1.1 1.1 0 0 1-.5.29z" fill="white"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
