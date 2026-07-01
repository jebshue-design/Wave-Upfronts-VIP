"use client";

import Image from "next/image";

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
  youtubeUrl: string;
  audioUrl: string;
};

function openShowModal(id: string) {
  window.dispatchEvent(new CustomEvent("open-show", { detail: { id } }));
}

export default function ShowCard({ show }: { show: Show }) {
  return (
    <>
      {/* ── CARD ── */}
      <div className="show-card-wrapper">
        <div className="show-card" onClick={() => openShowModal(show.id)} style={{ cursor: "pointer" }}>
          <div className="show-card-inner">

            {/* FRONT */}
            <div className="card-face card-thumb" style={{ background: "#161A16" }}>
              {show.thumbnailPath ? (
                <Image
                  src={show.thumbnailPath}
                  alt={show.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", background: show.categoryColor + "22" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: show.categoryColor, opacity: 0.4 }} />
                  <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: S.clay }}>Art pending</span>
                </div>
              )}
            </div>

            {/* BACK */}
            <div className="card-face card-back" style={{ background: S.night, display: "flex", flexDirection: "column", border: `1px solid ${S.line}` }}>
              <div style={{ height: "4px", background: show.categoryColor, flexShrink: 0 }} />
              <div style={{ padding: "22px 28px 0", flexShrink: 0 }}>
                <h3 style={{ fontFamily: S.fontDisplay, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver, margin: 0 }}>{show.title}</h3>
              </div>
              <div style={{ height: "1px", background: S.line, margin: "18px 28px 0" }} />
              <div style={{ padding: "18px 28px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 16px", flexShrink: 0 }}>
                {([
                  { label: "Target Demo", value: show.demo },
                  { label: "Format", value: show.specs },
                  { label: "Season", value: show.season },
                ] as { label: string; value: string }[]).map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontFamily: S.fontMono, fontSize: "8px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: S.clay, marginBottom: "5px" }}>{label}</div>
                    <div style={{ fontFamily: S.fontSans, fontSize: "13px", color: S.silver, lineHeight: 1.3 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: "1px", background: S.line, margin: "18px 28px" }} />
              <div style={{ padding: "0 28px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <p style={{ fontFamily: S.fontSans, fontSize: "13px", lineHeight: 1.6, color: S.clay, margin: "0 0 18px", overflow: "hidden", maxHeight: "62px" }}>{show.description}</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                  {show.youtubeUrl && (
                    <a href={show.youtubeUrl} target="_blank" rel="noopener noreferrer" title="Watch on YouTube"
                      style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #2E332E", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M15.665 1.879A2.007 2.007 0 0 0 14.253.46C13.01.12 8 .12 8 .12s-5.01 0-6.253.34A2.007 2.007 0 0 0 .335 1.88C0 3.13 0 5.74 0 5.74s0 2.61.335 3.861a2.007 2.007 0 0 0 1.412 1.419C2.99 11.36 8 11.36 8 11.36s5.01 0 6.253-.34a2.007 2.007 0 0 0 1.412-1.419C16 8.35 16 5.74 16 5.74s0-2.61-.335-3.861z" fill="#FF0000"/><path d="M6.4 8.2l4.16-2.46L6.4 3.28v4.92z" fill="white"/></svg>
                    </a>
                  )}
                  {show.audioUrl && (
                    <a href={show.audioUrl} target="_blank" rel="noopener noreferrer" title="Listen on Spotify"
                      style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #2E332E", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1DB954"/><path d="M17.25 16.5c-.19 0-.37-.06-.52-.18-1.57-1.05-3.54-1.6-5.73-1.6-1.19 0-2.38.16-3.5.47-.2.06-.42.03-.6-.08a.75.75 0 0 1-.33-.52.77.77 0 0 1 .53-.88c1.27-.36 2.62-.54 3.9-.54 2.47 0 4.72.63 6.51 1.83.28.19.4.55.29.86a.77.77 0 0 1-.55.64zm1.42-3.25a.93.93 0 0 1-.64-.24c-1.86-1.24-4.2-1.9-6.78-1.9-1.38 0-2.74.2-4.01.6a.93.93 0 0 1-1.16-.62.94.94 0 0 1 .62-1.17 15.1 15.1 0 0 1 4.55-.69c2.9 0 5.56.75 7.69 2.17.42.28.54.85.26 1.27a.93.93 0 0 1-.53.58zm1.6-3.6a1.1 1.1 0 0 1-.6-.18C17.53 7.85 14.87 7.06 12 7.06c-1.66 0-3.32.26-4.93.77a1.1 1.1 0 0 1-1.39-.72 1.1 1.1 0 0 1 .72-1.39A17.3 17.3 0 0 1 12 4.87c3.18 0 6.14.88 8.58 2.53a1.1 1.1 0 0 1-.31 1.96 1.1 1.1 0 0 1-.5.29z" fill="white"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </>
  );
}
