import Image from "next/image";
import { cookies } from "next/headers";
import { logout } from "./actions";
import IntroOverlay from "./components/IntroOverlay";
import AnimateCards from "./components/AnimateCards";
import NavLinks from "./components/NavLinks";
import RsvpForm from "./components/RsvpForm";
import RsvpModal from "./components/RsvpModal";
import TextIntro from "./components/TextIntro";
import ShowCard from "./components/ShowCard";
import ShowModalManager from "./components/ShowModalManager";

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
const INTRO_VIDEO_PATH: string | null = null;

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
export default async function VipPage() {
  const cookieStore = await cookies();
  const vipName = cookieStore.get("wave-name")?.value ?? null;
  return (
    <div style={{ background: S.night, minHeight: "100vh", color: S.silver }}>
      <RsvpModal />
      <ShowModalManager shows={shows} />
      {INTRO_VIDEO_PATH ? <IntroOverlay videoPath={INTRO_VIDEO_PATH} /> : <TextIntro name={vipName} />}
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
          <NavLinks shows={shows.map(s => ({ id: s.id, title: s.title, category: s.category, categoryColor: s.categoryColor }))} />

          {vipName && (
            <span style={{ fontFamily: S.fontMono, fontSize: "11px", color: S.clay, letterSpacing: "0.04em", marginRight: "16px" }}>
              Welcome, <span style={{ color: S.silver, fontWeight: 600 }}>{vipName}</span>
            </span>
          )}

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
              On Your<br />
              <span style={{ color: S.volt }}>Frequency</span>
            </h1>

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

          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: S.line, margin: "0 40px" }} />

      {/* ── RSVP ────────────────────────────────────────── */}
      <section id="rsvp" style={{ padding: "112px 40px", scrollMarginTop: "64px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <SectionHeader eyebrow="01 / RSVP" title="Join us in New York." />

          <div
            style={{
              marginTop: "72px",
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "80px",
              alignItems: "start",
            }}
          >
            {/* Left — event details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {[
                { label: "Date", value: "TBD · 2026" },
                { label: "Location", value: "New York, NY" },
                { label: "Format", value: "VIP Upfront Presentation" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div
                    style={{
                      fontFamily: S.fontMono,
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: S.volt,
                      marginBottom: "8px",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: S.fontSans,
                      fontSize: "18px",
                      fontWeight: 600,
                      color: S.silver,
                      lineHeight: 1.3,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Right — form */}
            <div>
              <RsvpForm />
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: "1px", background: S.line, margin: "0 40px" }} />

      {/* ── THE 2026 SLATE ──────────────────────────────── */}
      <section id="slate" style={{ padding: "112px 0", scrollMarginTop: "64px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 40px" }}>
          <SectionHeader eyebrow="02 / The Slate" title="The Slate" />
        </div>

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
          <SectionHeader eyebrow="03 / Audience" title="Who's watching." />

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
          <SectionHeader eyebrow="04 / Resources" title="Assets & one-sheets." />

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
          <SectionHeader eyebrow="05 / Contact" title="Your Wave team." />

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

type Show = typeof shows[number];
function ShowsMarquee({ shows }: { shows: Show[] }) {
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
