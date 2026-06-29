import Image from "next/image";
import { logout } from "./actions";
import IntroOverlay from "./components/IntroOverlay";
import AnimateCards from "./components/AnimateCards";
import NavLinks from "./components/NavLinks";

/* =========================================================
   SHOW DATA — swap in real content here
   ========================================================= */
const shows = [
  {
    id: "almost-athletes",
    title: "Almost Athletes",
    category: "COMEDY",
    categoryColor: "#D12670",
    tagline: "They never made the cut. They never stopped trying.",
    description: "Placeholder — replace with show description.",
    specs: "WEEKLY · ~60 MIN · AUDIO + VIDEO",
    season: "SEASON 2 · 2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–34 · Male-Leaning",
    thumbnailPath: "/thumbnails/almost-athletes.jpg",
    youtubeUrl: "https://www.youtube.com/@almostathletes",
    audioUrl: "https://open.spotify.com/show/55gaQm31JIbp6td7QtYsPU",
  },
  {
    id: "open-thoughts",
    title: "Open Thoughts",
    category: "INTERVIEW",
    categoryColor: "#0AC2FF",
    tagline: "Real conversations. No script.",
    description: "Placeholder — replace with show description.",
    specs: "BIWEEKLY · ~50 MIN · AUDIO + VIDEO",
    season: "SEASON 1 · 2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "25–44 · Mixed",
    thumbnailPath: "/thumbnails/open-thoughts.jpg",
    youtubeUrl: "https://www.youtube.com/@OpenThoughts0",
    audioUrl: "https://open.spotify.com/show/7AwnOVezHIfHVbNVINNlQL",
  },
  {
    id: "whiskey-ginger",
    title: "Whiskey Ginger",
    category: "LIFESTYLE",
    categoryColor: "#FFC421",
    tagline: "Drinks, stories, and the people who make them.",
    description: "Placeholder — replace with show description.",
    specs: "WEEKLY · ~55 MIN · AUDIO + VIDEO",
    season: "SEASON 5 · 2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "21–45 · Mixed",
    thumbnailPath: "/thumbnails/whiskey-ginger.jpg",
    youtubeUrl: "https://www.youtube.com/@AndrewSantinoWhiskeyGinger",
    audioUrl: "https://open.spotify.com/show/2QoIpuCjh332VOeDYxLr3A",
  },
  {
    id: "ngl",
    title: "Not Gonna Lie with Kylie Kelce",
    category: "CULTURE",
    categoryColor: "#A60AFF",
    tagline: "No filter. No landing page. Just sport.",
    description: "Placeholder — replace with show description.",
    specs: "WEEKLY · ~30 MIN · VIDEO",
    season: "SEASON 2 · 2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–30 · Female-Leaning",
    thumbnailPath: "/thumbnails/ngl.jpg",
    youtubeUrl: "https://www.youtube.com/@nglwithkylie",
    audioUrl: "https://open.spotify.com/show/0RgXbSGGmwpzAyeLHbDqUD",
  },
  {
    id: "so-true",
    title: "So True",
    category: "COMEDY",
    categoryColor: "#0AC2FF",
    tagline: "Placeholder — replace with tagline.",
    description: "Placeholder — replace with show description.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–34 · Mixed",
    thumbnailPath: "/thumbnails/so-true.jpg",
    youtubeUrl: "https://www.youtube.com/@sooootruepod",
    audioUrl: "https://open.spotify.com/show/3EgXpWE5vz6JkRtjhenVOU",
  },
  {
    id: "wingmen",
    title: "Wingmen",
    category: "SPORTS",
    categoryColor: "#0BDD65",
    tagline: "Placeholder — replace with tagline.",
    description: "Placeholder — replace with show description.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Male-Leaning",
    thumbnailPath: "/thumbnails/wingmen.jpg",
    youtubeUrl: "https://www.youtube.com/@Wingmenpod",
    audioUrl: "https://open.spotify.com/show/0phWiahC5nLC7azlkhe8hh",
  },
  {
    id: "7pm-brooklyn",
    title: "7PM in Brooklyn",
    category: "SPORTS",
    categoryColor: "#FF5C35",
    tagline: "Placeholder — replace with tagline.",
    description: "Placeholder — replace with show description.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Male-Leaning",
    thumbnailPath: "/thumbnails/7pm-brooklyn.jpg",
    youtubeUrl: "https://www.youtube.com/@7PMinBrooklyn",
    audioUrl: "https://open.spotify.com/show/4sEy5p87mJ002F3NGsKIpq",
  },
  {
    id: "big-bro",
    title: "Big Bro",
    category: "COMEDY",
    categoryColor: "#D12670",
    tagline: "Placeholder — replace with tagline.",
    description: "Placeholder — replace with show description.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–34 · Mixed",
    thumbnailPath: "/thumbnails/big-bro.jpg",
    youtubeUrl: "https://www.youtube.com/@BigBroCudi",
    audioUrl: null as string | null,
  },
  {
    id: "house-of-maher",
    title: "House of Maher",
    category: "COMEDY",
    categoryColor: "#FFC421",
    tagline: "Placeholder — replace with tagline.",
    description: "Placeholder — replace with show description.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Mixed",
    thumbnailPath: "/thumbnails/house-of-maher.jpg",
    youtubeUrl: "https://www.youtube.com/@HouseofMaher",
    audioUrl: "https://open.spotify.com/show/5kQkbgxHPgvBc0wcb9qhNK",
  },
  {
    id: "the-right-time",
    title: "The Right Time with Bomani Jones",
    category: "SPORTS",
    categoryColor: "#0BDD65",
    tagline: "Placeholder — replace with tagline.",
    description: "Placeholder — replace with show description.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "25–44 · Male-Leaning",
    thumbnailPath: "/thumbnails/the-right-time.jpg",
    youtubeUrl: "https://www.youtube.com/@righttimebomani",
    audioUrl: "https://open.spotify.com/show/6N7fDvgNz2EPDIOm49aj7M",
  },
];

/* =========================================================
   INTRO VIDEO — drop a file in /public/videos/ and set the path.
   Set to null to disable the intro overlay entirely.
   ========================================================= */
const INTRO_VIDEO_PATH: string | null = "/videos/2026_WaveUpfrontSizzle_v6.mp4";

/* =========================================================
   DOWNLOADABLE ASSETS — swap in real files
   ========================================================= */
const downloads = [
  { label: "Wave Upfronts 2026 — Full Deck", file: null as string | null, type: "PDF" },
  { label: "Wave Network Overview", file: null as string | null, type: "PDF" },
  { label: "Audience & Reach Report", file: null as string | null, type: "PDF" },
  { label: "2026 Advertising Opportunities", file: null as string | null, type: "PDF" },
];

/* =========================================================
   DESIGN TOKENS
   ========================================================= */
const S = {
  night: "#0B0909",
  slate: "#212922",
  line: "#2E332E",
  lineStrong: "#3F4640",
  silver: "#FAF7F4",
  clay: "#94958B",
  volt: "#E3F643",
  fgMuted: "#B7B8AF",

  fontDisplay: '"Zalando Sans Expanded", "Helvetica Neue Condensed", system-ui, sans-serif',
  fontSans: '"Zalando Sans", "Inter", system-ui, sans-serif',
  fontMono: '"Space Grotesk", ui-monospace, monospace',
  fontSerif: '"IBM Plex Serif", "Times New Roman", serif',

  pill: "999px",
};

/* =========================================================
   PAGE
   ========================================================= */
export default function VipPage() {
  return (
    <div style={{ background: S.night, minHeight: "100vh", color: S.silver }}>
      {INTRO_VIDEO_PATH && <IntroOverlay videoPath={INTRO_VIDEO_PATH} />}
      <style>{`
        /* ── Card Entrance ─────────────────────── */
        .show-card-wrapper {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .show-card-wrapper.card-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Card Flip ─────────────────────────── */
        .show-card {
          perspective: 1200px;
          aspect-ratio: 3 / 4;
          cursor: pointer;
        }
        .show-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.72s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }
        .show-card:hover .show-card-inner {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          border-radius: 16px;
        }
        .card-back {
          transform: rotateY(180deg);
        }
        .card-face img {
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }
        .show-card:hover .card-face:not(.card-back) img {
          transform: scale(1.04) !important;
        }

        .stat-card {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      box-shadow 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.55);
        }

        .contact-card {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      box-shadow 0.3s ease;
        }
        .contact-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.55);
        }
        .contact-email {
          color: #94958B;
          border-bottom: 1px solid #2E332E;
          padding-bottom: 2px;
          text-decoration: none;
          transition: color 0.15s ease, border-color 0.15s ease;
          display: inline-block;
        }
        .contact-email:hover {
          color: #E3F643;
          border-bottom-color: #E3F643;
        }

        .download-row {
          transition: background 0.18s ease;
        }
        .download-row:hover {
          background: rgba(63, 70, 64, 0.35) !important;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marquee-scroll 32s linear infinite;
        }
        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused;
        }
        .marquee-item {
          transition: opacity 0.2s ease;
        }
        .marquee-wrapper:hover .marquee-item:hover {
          opacity: 0.75;
        }
      `}</style>

      {/* ── NAV — clean, no bottom border ──────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(11,9,9,0.88)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: "64px",
        }}
      >
        <Image
          src="/assets/wave-primary-lockup-white.svg"
          alt="Wave Sports & Entertainment"
          width={168}
          height={16}
          priority
        />

        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          <NavLinks />

          <form action={logout}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: `1px solid ${S.volt}`,
                borderRadius: S.pill,
                color: S.volt,
                fontFamily: S.fontMono,
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "7px 18px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      {/* ── HERO — open, breathable, volt dot ───────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 40px 100px",
          overflow: "hidden",
        }}
      >
        {/* Subtle volt glow at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "10%",
            width: "600px",
            height: "500px",
            background: "radial-gradient(ellipse at center, rgba(227,246,67,0.06) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: S.fontMono,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: S.clay,
              marginBottom: "32px",
            }}
          >
            VIP Access · Confidential
          </div>

          {/* Headline with volt dot accent (matching wave.tv) */}
          <div style={{ position: "relative", marginBottom: "48px" }}>
            <h1
              style={{
                fontFamily: S.fontDisplay,
                fontSize: "clamp(64px, 9vw, 140px)",
                fontWeight: 700,
                letterSpacing: "-0.015em",
                lineHeight: 1.0,
                color: S.silver,
                margin: 0,
              }}
            >
              Building<br />
              The Future<br />
              <span style={{ color: S.volt }}>of Fandom</span>
            </h1>

            {/* Volt circle dot — wave.tv signature element */}
            <div
              style={{
                position: "absolute",
                bottom: "-24px",
                left: "0",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: S.volt,
              }}
            />
          </div>

          {/* Sub-copy + stats row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "80px",
              flexWrap: "wrap",
              paddingTop: "48px",
            }}
          >
            <p
              style={{
                fontFamily: S.fontSans,
                fontSize: "20px",
                lineHeight: 1.6,
                color: S.fgMuted,
                maxWidth: "480px",
                margin: 0,
              }}
            >
              Wave Sports & Entertainment partners with culture-first creators
              to build sports IP that moves. This is the 2026 slate.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                ["SHOWS", `${shows.length} Originals`],
                ["FORMAT", "Audio + Video"],
                ["REACH", "Replace with stats"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: "20px", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontFamily: S.fontMono,
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: S.clay,
                      minWidth: "72px",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: S.fontMono,
                      fontSize: "14px",
                      fontWeight: 500,
                      color: S.silver,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: S.line, margin: "0 40px" }} />

      {/* ── THE 2026 SLATE ──────────────────────────────── */}
      <section id="slate" style={{ padding: "112px 0", scrollMarginTop: "64px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
          <SectionHeader eyebrow="01 / The Slate" title="2026 Originals." />
        </div>

        {/* Full-width scrolling show ticker */}
        <ShowsMarquee shows={shows} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
          {/* Open card grid — gaps instead of 1px border lines */}
          <AnimateCards>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "24px",
                marginTop: "72px",
              }}
            >
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </AnimateCards>
        </div>
      </section>

      <div style={{ height: "1px", background: S.line, margin: "0 40px" }} />

      {/* ── AUDIENCE ────────────────────────────────────── */}
      <section id="audience" style={{ padding: "112px 40px", scrollMarginTop: "64px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <SectionHeader eyebrow="02 / Audience" title="Who's watching." />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
              marginTop: "72px",
            }}
          >
            {[
              { stat: "0M+", label: "Monthly listeners", note: "Replace with real stat" },
              { stat: "0%", label: "18–34 audience share", note: "Replace with real stat" },
              { stat: "0+", label: "Partner brands", note: "Replace with real stat" },
              { stat: "0M+", label: "Social reach", note: "Replace with real stat" },
            ].map(({ stat, label, note }) => (
              <div
                key={label}
                className="stat-card"
                style={{
                  background: S.slate,
                  padding: "48px 36px",
                  borderRadius: "2px",
                }}
              >
                <div
                  style={{
                    fontFamily: S.fontDisplay,
                    fontSize: "clamp(48px, 5vw, 72px)",
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    lineHeight: 1,
                    color: S.volt,
                    marginBottom: "16px",
                  }}
                >
                  {stat}
                </div>
                <div
                  style={{
                    fontFamily: S.fontSans,
                    fontSize: "17px",
                    color: S.silver,
                    marginBottom: "8px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: S.fontMono,
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: S.clay,
                  }}
                >
                  {note}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <div style={{ height: "1px", background: S.line, margin: "0 40px" }} />

      {/* ── DOWNLOADS ───────────────────────────────────── */}
      <section id="assets" style={{ padding: "112px 40px", scrollMarginTop: "64px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <SectionHeader eyebrow="03 / Resources" title="Assets & one-sheets." />

          <div
            style={{
              marginTop: "72px",
              border: `1px solid ${S.line}`,
              borderRadius: "2px",
            }}
          >
            {shows.map((show) => (
              <DownloadRow
                key={show.id}
                label={`${show.title} — One-Sheet`}
                type="PDF"
                file={show.oneSheetPath}
                isLast={false}
              />
            ))}
            {downloads.map((d, i) => (
              <DownloadRow
                key={d.label}
                label={d.label}
                type={d.type}
                file={d.file}
                isLast={i === downloads.length - 1}
              />
            ))}
          </div>

          <p
            style={{
              fontFamily: S.fontMono,
              fontSize: "11px",
              letterSpacing: "0.04em",
              color: S.clay,
              marginTop: "24px",
            }}
          >
            Files marked "Upload pending" will be available before the event.
          </p>
        </div>
      </section>

      <div style={{ height: "1px", background: S.line, margin: "0 40px" }} />

      {/* ── CONTACT ─────────────────────────────────────── */}
      <section id="contact" style={{ padding: "112px 40px", scrollMarginTop: "64px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <SectionHeader eyebrow="04 / Contact" title="Your Wave team." />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2px",
              marginTop: "72px",
            }}
          >
            {[
              {
                name: "Brian Verne",
                role: "Chief Executive Officer",
                company: "Wave Sports & Entertainment",
                email: "brian@wave.tv",
                headshot: "/headshots/brian-verne.jpg",
              },
              {
                name: "Mack Sovereign",
                role: "Chief Content Officer",
                company: "Wave Sports & Entertainment",
                email: "mack@wave.tv",
                headshot: "/headshots/mack-sovereign.jpg",
              },
              {
                name: "Ryan Jann",
                role: "Chief Business Officer",
                company: "Wave Sports & Entertainment",
                email: "ryan.jann@wave.tv",
                headshot: "/headshots/ryan-jann.jpg",
              },
              {
                name: "Meg Jones",
                role: "EVP, Head of Sales",
                company: "Wave Sports & Entertainment",
                email: "meghan.jones@wave.tv",
                headshot: "/headshots/meg-jones.jpg",
              },
            ].map((c, i) => (
              <div
                key={i}
                className="contact-card"
                style={{
                  background: S.slate,
                  padding: "40px 36px 40px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                }}
              >
                {/* Headshot */}
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    marginBottom: "24px",
                    overflow: "hidden",
                    background: "#2E332E",
                    flexShrink: 0,
                    border: "2px solid #2E332E",
                  }}
                >
                  {c.headshot ? (
                    <Image
                      src={c.headshot}
                      alt={c.name}
                      width={80}
                      height={80}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    /* placeholder silhouette */
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
                      <rect width="80" height="80" fill="#2A332B"/>
                      <circle cx="40" cy="30" r="14" fill="#3F4640"/>
                      <ellipse cx="40" cy="66" rx="22" ry="16" fill="#3F4640"/>
                    </svg>
                  )}
                </div>

                {/* Volt rule */}
                <div style={{ width: "24px", height: "2px", background: S.volt, marginBottom: "20px" }} />

                {/* Name */}
                <div
                  style={{
                    fontFamily: S.fontDisplay,
                    fontSize: "22px",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: S.silver,
                    marginBottom: "6px",
                    lineHeight: 1.1,
                  }}
                >
                  {c.name}
                </div>

                {/* Role */}
                <div
                  style={{
                    fontFamily: S.fontMono,
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: S.volt,
                    marginBottom: "4px",
                  }}
                >
                  {c.role}
                </div>

                <div style={{ marginBottom: "28px" }} />

                {/* Email */}
                <a
                  href={`mailto:${c.email}`}
                  className="contact-email"
                  style={{
                    fontFamily: S.fontMono,
                    fontSize: "12px",
                    letterSpacing: "0.04em",
                    marginTop: "auto",
                  }}
                >
                  {c.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${S.line}`,
          padding: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Image
          src="/assets/wave-primary-lockup-white.svg"
          alt="Wave Sports & Entertainment"
          width={140}
          height={13}
        />
        <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: S.fontMono,
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: S.clay,
            }}
          >
            Confidential · VIP Only
          </span>
          <span
            style={{
              fontFamily: S.fontMono,
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: S.lineStrong,
            }}
          >
            © 2026 Wave Sports & Entertainment
          </span>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS
   ========================================================= */

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ display: "flex", gap: "56px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div
        style={{
          fontFamily: S.fontMono,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: S.clay,
          minWidth: "120px",
          paddingTop: "8px",
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: S.fontDisplay,
          fontSize: "clamp(40px, 4.5vw, 64px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.0,
          color: S.silver,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function ShowCard({ show }: { show: (typeof shows)[0] }) {
  return (
    <div className="show-card-wrapper">
    <div className="show-card">
      <div className="show-card-inner">

        {/* ── FRONT ── full-bleed poster */}
        <div
          className="card-face card-thumb"
          style={{ background: "#161A16" }}
        >
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
              <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: S.clay }}>Art pending</span>
            </div>
          )}


        </div>

        {/* ── BACK ── */}
        <div
          className="card-face card-back"
          style={{ background: S.night, display: "flex", flexDirection: "column", border: `1px solid ${S.line}` }}
        >
          {/* Accent bar */}
          <div style={{ height: "4px", background: show.categoryColor, flexShrink: 0 }} />

          {/* Header */}
          <div style={{ padding: "22px 28px 0", flexShrink: 0 }}>
            <div style={{ fontFamily: S.fontMono, fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: show.categoryColor, marginBottom: "8px" }}>
              {show.category}
            </div>
            <h3 style={{ fontFamily: S.fontDisplay, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: S.silver, margin: 0 }}>
              {show.title}
            </h3>
          </div>

          <div style={{ height: "1px", background: S.line, margin: "18px 28px 0" }} />

          {/* Info grid */}
          <div style={{ padding: "18px 28px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 16px", flexShrink: 0 }}>
            {([
              { label: "Target Demo", value: show.demo },
              { label: "Format", value: show.specs },
              { label: "Season", value: show.season },
              { label: "Reach", value: "Add stat" },
            ] as { label: string; value: string }[]).map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontFamily: S.fontMono, fontSize: "8px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: S.clay, marginBottom: "5px" }}>
                  {label}
                </div>
                <div style={{ fontFamily: S.fontSans, fontSize: "13px", color: S.silver, lineHeight: 1.3 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: S.line, margin: "18px 28px" }} />

          {/* Description + CTAs */}
          <div style={{ padding: "0 28px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <p style={{ fontFamily: S.fontSans, fontSize: "13px", lineHeight: 1.6, color: S.clay, margin: "0 0 18px", overflow: "hidden", maxHeight: "62px" }}>
              {show.description}
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {show.videoPath ? (
                <a href={show.videoPath} style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: S.night, background: S.volt, textDecoration: "none", padding: "10px 18px", borderRadius: S.pill, flexShrink: 0 }}>
                  ▶ Sizzle Reel
                </a>
              ) : (
                <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#3F4640", border: "1px solid #2E332E", padding: "10px 18px", borderRadius: S.pill }}>
                  Reel Pending
                </span>
              )}
              {show.oneSheetPath ? (
                <a href={show.oneSheetPath} download style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: S.volt, textDecoration: "none", border: `1px solid ${S.volt}`, padding: "10px 18px", borderRadius: S.pill }}>
                  One-Sheet
                </a>
              ) : (
                <span style={{ fontFamily: S.fontMono, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#3F4640", border: "1px solid #2E332E", padding: "10px 18px", borderRadius: S.pill }}>
                  Sheet Pending
                </span>
              )}

              {/* Platform icon links */}
              {show.youtubeUrl && (
                <a href={show.youtubeUrl} target="_blank" rel="noopener noreferrer" title="Watch on YouTube"
                  style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #2E332E", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.665 1.879A2.007 2.007 0 0 0 14.253.46C13.01.12 8 .12 8 .12s-5.01 0-6.253.34A2.007 2.007 0 0 0 .335 1.88C0 3.13 0 5.74 0 5.74s0 2.61.335 3.861a2.007 2.007 0 0 0 1.412 1.419C2.99 11.36 8 11.36 8 11.36s5.01 0 6.253-.34a2.007 2.007 0 0 0 1.412-1.419C16 8.35 16 5.74 16 5.74s0-2.61-.335-3.861z" fill="#FF0000"/>
                    <path d="M6.4 8.2l4.16-2.46L6.4 3.28v4.92z" fill="white"/>
                  </svg>
                </a>
              )}
              {show.audioUrl && (
                <a href={show.audioUrl} target="_blank" rel="noopener noreferrer" title="Listen on Spotify"
                  style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #2E332E", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#1DB954"/>
                    <path d="M17.25 16.5c-.19 0-.37-.06-.52-.18-1.57-1.05-3.54-1.6-5.73-1.6-1.19 0-2.38.16-3.5.47-.2.06-.42.03-.6-.08a.75.75 0 0 1-.33-.52.77.77 0 0 1 .53-.88c1.27-.36 2.62-.54 3.9-.54 2.47 0 4.72.63 6.51 1.83.28.19.4.55.29.86a.77.77 0 0 1-.55.64zm1.42-3.25a.93.93 0 0 1-.64-.24c-1.86-1.24-4.2-1.9-6.78-1.9-1.38 0-2.74.2-4.01.6a.93.93 0 0 1-1.16-.62.94.94 0 0 1 .62-1.17 15.1 15.1 0 0 1 4.55-.69c2.9 0 5.56.75 7.69 2.17.42.28.54.85.26 1.27a.93.93 0 0 1-.53.58zm1.6-3.6a1.1 1.1 0 0 1-.6-.18C17.53 7.85 14.87 7.06 12 7.06c-1.66 0-3.32.26-4.93.77a1.1 1.1 0 0 1-1.39-.72 1.1 1.1 0 0 1 .72-1.39A17.3 17.3 0 0 1 12 4.87c3.18 0 6.14.88 8.58 2.53a1.1 1.1 0 0 1-.31 1.96 1.1 1.1 0 0 1-.5.29z" fill="white"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}

function ShowsMarquee({ shows }: { shows: typeof shows }) {
  const doubled = [...shows, ...shows];
  return (
    <div
      className="marquee-wrapper"
      style={{
        overflow: "hidden",
        borderTop: `1px solid ${S.line}`,
        borderBottom: `1px solid ${S.line}`,
        margin: "64px 0 0",
        background: S.night,
        cursor: "default",
      }}
    >
      <div className="marquee-track">
        {doubled.map((show, i) => (
          <div
            key={`${show.id}-${i}`}
            className="marquee-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "18px 48px",
              borderRight: `1px solid ${S.line}`,
              flexShrink: 0,
            }}
          >
            {show.thumbnailPath && (
              <div
                style={{
                  borderRadius: "2px",
                  overflow: "hidden",
                  flexShrink: 0,
                  width: "80px",
                  height: "45px",
                  position: "relative",
                }}
              >
                <Image
                  src={show.thumbnailPath}
                  alt={show.title}
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <span
              style={{
                fontFamily: S.fontDisplay,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: S.silver,
                whiteSpace: "nowrap",
              }}
            >
              {show.title}
            </span>
            <span
              style={{
                display: "inline-block",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: S.volt,
                flexShrink: 0,
                marginLeft: "4px",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function DownloadRow({
  label,
  type,
  file,
  isLast,
}: {
  label: string;
  type: string;
  file: string | null;
  isLast: boolean;
}) {
  return (
    <div
      className="download-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 28px",
        borderBottom: isLast ? "none" : `1px solid ${S.line}`,
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span
          style={{
            fontFamily: S.fontMono,
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: S.night,
            background: S.clay,
            padding: "3px 8px",
            borderRadius: S.pill,
          }}
        >
          {type}
        </span>
        <span
          style={{
            fontFamily: S.fontSans,
            fontSize: "15px",
            color: S.silver,
          }}
        >
          {label}
        </span>
      </div>

      {file ? (
        <a
          href={file}
          download
          style={{
            fontFamily: S.fontMono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: S.volt,
            textDecoration: "none",
            border: `1px solid ${S.volt}`,
            padding: "8px 20px",
            flexShrink: 0,
            borderRadius: S.pill,
          }}
        >
          Download
        </a>
      ) : (
        <span
          style={{
            fontFamily: S.fontMono,
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#3F4640",
          }}
        >
          Upload pending
        </span>
      )}
    </div>
  );
}
