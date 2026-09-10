"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RsvpModal from "./RsvpModal";

const arrowAsset = "/assets/Site Arrow.svg";

export type SlateItem = {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  season: string;
  slateImagePath?: string;
  detailNavTone?: "light" | "dark";
  accoladeLogoPath?: string;
  accolades?: string[];
  accoladeGroups?: { logoPath: string; logoAlt: string; accolades: string[] }[];
  talent?: string;
  tagline?: string;
  description?: string;
  specs?: string;
  demo?: string;
  detailTopics?: string[];
  detailDescription?: string;
  detailDemographics?: string;
  detailCadence?: string;
  detailFormat?: string;
  detailPartnerships?: string;
};

export default function SlateCarousel({ shows }: { shows: SlateItem[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedShow, setExpandedShow] = useState<SlateItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [activeNav, setActiveNav] = useState<"slate" | "audience" | "assets">("slate");
  const detailNavRef = useRef<HTMLElement>(null);
  const siteNavRef = useRef<HTMLElement>(null);
  const [navIndicator, setNavIndicator] = useState({ left: 0, width: 0 });
  const [downloadedAssets, setDownloadedAssets] = useState<Set<string>>(new Set());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [detailOrigin, setDetailOrigin] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const scrollVelocity = useRef(0);
  const lastScrollLeft = useRef(0);
  const parallaxFrame = useRef<number | null>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ x: 0, lastX: 0, lastTime: 0 });
  const dragVelocity = useRef(0);
  const momentumFrame = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const momentumActiveRef = useRef(false);
  const didDrag = useRef(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateParallax = () => {
      const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-slate-card]"));
      const center = rail.scrollLeft + rail.clientWidth / 2;

      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const signedDistance = Math.max(-1.5, Math.min(1.5, (cardCenter - center) / rail.clientWidth));
        const distance = Math.abs(signedDistance);
        const focus = Math.pow(Math.max(0, 1 - distance), 0.58);
        const focusDistance = Math.max(0, distance - 0.08);
        const velocityLag = scrollVelocity.current * (1 - Math.min(1, Math.abs(signedDistance)) * 0.35);
        card.style.setProperty("--parallax-x", `${signedDistance * 72}px`);
        card.style.setProperty("--parallax-rotate", `${signedDistance * -7}deg`);
        card.style.setProperty("--parallax-opacity", `${0.34 + focus * 0.66}`);
        card.style.setProperty("--card-blur", `${Math.min(8, focusDistance * 8)}px`);
        card.style.setProperty("--glass-blur", `${Math.min(14, focusDistance * 14)}px`);
        card.style.setProperty("--card-saturation", `${1 - Math.min(0.28, focusDistance * 0.24)}`);
        card.style.setProperty("--glass-opacity", `${Math.min(0.24, focusDistance * 0.18)}`);
        card.style.setProperty("--card-lift", `${28 - focus * 28}px`);
        card.style.setProperty("--card-scale", `${0.9 + focus * 0.1}`);
        card.style.setProperty("--scroll-lag", `${velocityLag * -92}px`);
      });

      scrollVelocity.current *= 0.88;
      if (Math.abs(scrollVelocity.current) > 0.001) {
        parallaxFrame.current = requestAnimationFrame(updateParallax);
      } else {
        scrollVelocity.current = 0;
        parallaxFrame.current = null;
      }
    };

    const onScroll = () => {
      const delta = rail.scrollLeft - lastScrollLeft.current;
      lastScrollLeft.current = rail.scrollLeft;
      scrollVelocity.current = Math.max(-1.25, Math.min(1.25, delta / rail.clientWidth * 0.7));
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      const center = rail.scrollLeft + rail.clientWidth / 2;
      const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-slate-card]"));
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(center - cardCenter);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });
      setActiveIndex(nearest);
      if (snapTimer.current) clearTimeout(snapTimer.current);
      if (draggingRef.current || momentumActiveRef.current) {
        if (parallaxFrame.current === null) {
          parallaxFrame.current = requestAnimationFrame(updateParallax);
        }
        return;
      }
      snapTimer.current = setTimeout(() => {
        const card = cards[nearest];
        if (!card) return;
        const railRect = rail.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const visibleWidth = Math.max(0, Math.min(cardRect.right, railRect.right) - Math.max(cardRect.left, railRect.left));
        const visibleRatio = visibleWidth / cardRect.width;
        if (visibleRatio < 0.6) return;
        const targetScrollLeft = card.offsetLeft + card.offsetWidth / 2 - rail.clientWidth / 2;
        if (Math.abs(targetScrollLeft - rail.scrollLeft) > 2) {
          rail.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
        }
      }, 180);
      if (parallaxFrame.current === null) {
        parallaxFrame.current = requestAnimationFrame(updateParallax);
      }
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      rail.removeEventListener("scroll", onScroll);
      if (snapTimer.current) clearTimeout(snapTimer.current);
      if (parallaxFrame.current !== null) cancelAnimationFrame(parallaxFrame.current);
    };
  }, []);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !event.shiftKey) return;
    event.preventDefault();
    rail.scrollLeft += event.deltaY || event.deltaX;
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || event.button !== 0) return;
    event.preventDefault();
    if (momentumFrame.current !== null) cancelAnimationFrame(momentumFrame.current);
    draggingRef.current = true;
    momentumActiveRef.current = false;
    rail.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, lastX: event.clientX, lastTime: performance.now() };
    dragVelocity.current = 0;
    didDrag.current = false;
    setIsDragging(true);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !draggingRef.current) return;
    event.preventDefault();
    const now = performance.now();
    const delta = event.clientX - dragRef.current.lastX;
    const elapsed = Math.max(1, now - dragRef.current.lastTime);
    if (Math.abs(event.clientX - dragRef.current.x) > 5) didDrag.current = true;
    rail.scrollLeft -= delta;
    dragVelocity.current = dragVelocity.current * 0.6 + (-delta / elapsed * 16) * 0.4;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastTime = now;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (rail?.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    draggingRef.current = false;
    setIsDragging(false);
    if (!rail || Math.abs(dragVelocity.current) < 0.25) {
      requestAnimationFrame(() => rail.dispatchEvent(new Event("scroll")));
      return;
    }
    momentumActiveRef.current = true;
    const coast = () => {
      const currentRail = railRef.current;
      if (!currentRail || Math.abs(dragVelocity.current) < 0.25) {
        momentumFrame.current = null;
        momentumActiveRef.current = false;
        requestAnimationFrame(() => currentRail?.dispatchEvent(new Event("scroll")));
        return;
      }
      const before = currentRail.scrollLeft;
      currentRail.scrollLeft += dragVelocity.current;
      if (before === currentRail.scrollLeft) {
        momentumFrame.current = null;
        dragVelocity.current = 0;
        momentumActiveRef.current = false;
        currentRail.dispatchEvent(new Event("scroll"));
        return;
      }
      dragVelocity.current *= 0.93;
      momentumFrame.current = requestAnimationFrame(coast);
    };
    momentumFrame.current = requestAnimationFrame(coast);
  };

  const cancelClickAfterDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!didDrag.current) return;
    event.preventDefault();
    event.stopPropagation();
    didDrag.current = false;
  };
  const downloadAsset = (label: string, file?: string) => {
    if (!file) return;
    const link = document.createElement("a");
    link.href = file;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadedAssets((current) => new Set(current).add(label));
  };

  const closeShow = () => {
    setIsClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setExpandedShow(null);
      setIsClosing(false);
      setIsReturning(true);
      if (returnTimer.current) clearTimeout(returnTimer.current);
      returnTimer.current = setTimeout(() => setIsReturning(false), 700);
    }, 1000);
  };
  const selectAudience = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveNav("audience");
    const page = event.currentTarget.closest<HTMLElement>(".slate-page");
    const audience = document.getElementById("audience");
    if (page && audience) page.scrollTo({ top: audience.offsetTop, behavior: "smooth" });
  };
  const selectAssets = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveNav("assets");
    const page = event.currentTarget.closest<HTMLElement>(".slate-page");
    const assets = document.getElementById("assets");
    if (page && assets) page.scrollTo({ top: assets.offsetTop, behavior: "smooth" });
  };
  const selectSlate = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveNav("slate");
    const page = event.currentTarget.closest<HTMLElement>(".slate-page");
    page?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const updateIndicator = () => {
      const nav = expandedShow ? detailNavRef.current : siteNavRef.current;
      const target = nav?.querySelector<HTMLElement>(`.nav-${activeNav}`);
      if (!nav || !target) return;
      const navRect = nav.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setNavIndicator({ left: targetRect.left - navRect.left, width: targetRect.width });
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeNav, expandedShow]);
  const openShow = (show: SlateItem, event: React.MouseEvent<HTMLButtonElement>) => {
    const card = event.currentTarget.closest<HTMLElement>("[data-slate-card]");
    const rect = card?.getBoundingClientRect();
    if (rect) {
      setDetailOrigin({
        top: rect.top,
        right: window.innerWidth - rect.right,
        bottom: window.innerHeight - rect.bottom,
        left: rect.left,
      });
    }
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsClosing(false);
    setExpandedShow(show);
  };

  useEffect(() => {
    if (!expandedShow) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeShow();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedShow]);

  return (
    <main className={`slate-page${expandedShow ? " has-detail" : ""}${isReturning ? " is-returning" : ""}${expandedShow?.detailNavTone === "dark" ? " detail-nav-dark" : ""}`}>
      <RsvpModal />
      {expandedShow && (
        <section
          className={`slate-detail${isClosing ? " is-closing" : ""}`}
          aria-label={`${expandedShow.title} details`}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && isClosing) {
              if (closeTimer.current) clearTimeout(closeTimer.current);
              setExpandedShow(null);
              setIsClosing(false);
            }
          }}
          style={{
            "--origin-top": `${detailOrigin.top}px`,
            "--origin-right": `${detailOrigin.right}px`,
            "--origin-bottom": `${detailOrigin.bottom}px`,
            "--origin-left": `${detailOrigin.left}px`,
          } as React.CSSProperties}
        >
          <img className="slate-detail-image" src={expandedShow.slateImagePath} alt="" />
          <div className="slate-detail-shade" />
          <header className="slate-detail-header">
            <img src="/assets/Wave Logo.svg" alt="Wave Sports & Entertainment" />
            <nav ref={detailNavRef} aria-label="Show navigation">
              <Link className={`nav-slate${activeNav === "slate" ? " slate-nav-active" : ""}`} href="/" onClick={selectSlate}>SLATE</Link>
              <Link className={`nav-audience${activeNav === "audience" ? " slate-nav-active" : ""}`} href="/#audience" onClick={selectAudience}>AUDIENCE</Link>
              <Link className={`nav-assets${activeNav === "assets" ? " slate-nav-active" : ""}`} href="/#assets" onClick={selectAssets}>ASSETS</Link>
              <button type="button" onClick={() => window.dispatchEvent(new Event("open-rsvp"))}>RSVP</button>
              <span className="slate-nav-indicator" style={{ left: navIndicator.left, width: navIndicator.width }} />
            </nav>
          </header>
          <button className="slate-detail-back" type="button" onClick={closeShow} aria-label="Back" title="Back">
            <img className="back-outline-art" src="/assets/Back Arrow@3x.png" alt="" draggable={false} />
            <img className="pill-fill-art" src="/assets/Back Fill.png" alt="" draggable={false} />
          </button>
          <div className="slate-detail-content">
            <span className="slate-detail-category">{expandedShow.category}</span>
            <h1>{expandedShow.id === "ngl" ? "Not Gonna Lie" : expandedShow.title}</h1>
            <p className="slate-detail-talent">{expandedShow.talent ?? expandedShow.category}</p>
            <div className="slate-detail-tags">
              {(expandedShow.detailTopics ?? [expandedShow.category]).map((topic) => <span key={topic}>{topic}</span>)}
            </div>
            <p className="slate-detail-description">{expandedShow.detailDescription ?? expandedShow.description ?? expandedShow.tagline}</p>
            <div className="slate-detail-specs">
              <div><span>DEMOGRAPHICS</span><strong>{expandedShow.detailDemographics ?? expandedShow.demo ?? "MIXED"}</strong></div>
              <div><span>CADENCE</span><strong>{expandedShow.detailCadence ?? "WEEKLY"}</strong></div>
              <div><span>FORMAT</span><strong>{expandedShow.detailFormat ?? expandedShow.specs ?? "WAVE ORIGINALS"}</strong></div>
            </div>
          </div>
        </section>
      )}
      <header className="slate-header">
        <img className="slate-mark" src="/assets/Wave Logo.svg" alt="Wave Sports & Entertainment" />
        <nav ref={siteNavRef} className="slate-nav" aria-label="Site navigation">
          <Link className={`nav-slate${activeNav === "slate" ? " slate-nav-active" : ""}`} href="/" onClick={selectSlate}>SLATE</Link>
          <Link className={`nav-audience${activeNav === "audience" ? " slate-nav-active" : ""}`} href="/#audience" onClick={selectAudience}>AUDIENCE</Link>
          <Link className={`nav-assets${activeNav === "assets" ? " slate-nav-active" : ""}`} href="/#assets" onClick={selectAssets}>ASSETS</Link>
          <button type="button" className="slate-rsvp" onClick={() => window.dispatchEvent(new Event("open-rsvp"))}>RSVP</button>
          <span className="slate-nav-indicator" style={{ left: navIndicator.left, width: navIndicator.width }} />
        </nav>
      </header>

      <section className="slate-stage" aria-label="Wave 2026 slate">
        <div
          ref={railRef}
          className={`slate-rail${isDragging ? " is-dragging" : ""}`}
          onWheel={handleWheel}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={cancelClickAfterDrag}
          onDragStart={(event) => event.preventDefault()}
        >
          <div className="slate-spacer" />
          {shows.map((show, index) => (
            <article
              key={show.id}
              data-slate-card
              className={`slate-card${index === activeIndex ? " is-active" : ""}`}
              style={{ "--accent": show.categoryColor } as React.CSSProperties}
            >
              <div className="slate-frame">
                {show.slateImagePath && <img className="slate-image" src={show.slateImagePath} alt="" draggable={false} />}
                {(show.accoladeGroups || (show.accoladeLogoPath && show.accolades)) && (
                  <div className="slate-accolades" aria-label="Accolades">
                    {(show.accoladeGroups ?? [{ logoPath: show.accoladeLogoPath!, logoAlt: "The Webby Awards", accolades: show.accolades! }]).map((group) => (
                      <div className="slate-accolade-group" key={group.logoPath}>
                        <img src={group.logoPath} alt={group.logoAlt} draggable={false} />
                        <div className="slate-accolade-list">
                          {group.accolades.map((accolade) => {
                            const [year, ...lines] = accolade.split("|");
                            return (
                              <div className="slate-accolade" key={accolade}>
                                <span>{year}</span>
                                <strong>{lines.map((line) => <em key={line}>{line}</em>)}</strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <img
                  className={`frame-brand${["whiskey-ginger", "so-true", "my-momma-told-me", "bad-friends"].includes(show.id) ? " frame-brand-wave" : ""}`}
                  src={["whiskey-ginger", "so-true", "my-momma-told-me", "bad-friends"].includes(show.id) ? "/assets/Wave Logo.svg" : "/assets/Wave Originals Logo.svg"}
                  alt={["whiskey-ginger", "so-true", "my-momma-told-me", "bad-friends"].includes(show.id) ? "Wave" : "Wave Originals"}
                  draggable={false}
                />
              </div>
              <div className="slate-card-info">
                <div>
                  <span className="slate-category">{show.category}</span>
                  <h1>{show.id === "ngl" ? "Not Gonna Lie" : show.title}</h1>
                  <p className="slate-talent">{show.talent ?? show.category}</p>
                </div>
                <div className="slate-card-meta">
                  <button className="explore-label" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => openShow(show, event)}>
                    <span className="explore-outline-text">EXPLORE</span> <img className="explore-outline-art" src={arrowAsset} alt="" />
                    <img className="pill-fill-art" src="/assets/Explore Fill.png" alt="" draggable={false} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          <div className="slate-spacer" />
        </div>
      </section>

      <section id="audience" className="slate-audience" aria-labelledby="audience-heading">
        <div className="slate-audience-inner">
          <div className="slate-audience-heading">
            <h2 id="audience-heading">Who&apos;s Watching.</h2>
          </div>
          <div className="slate-audience-metrics">
            {[
              ["0M+", "MONTHLY LISTENERS"],
              ["0%", "18–34 AUDIENCE SHARE"],
              ["0+", "PARTNER BRANDS"],
              ["0M+", "SOCIAL REACH"],
            ].map(([value, label]) => (
              <div className="slate-audience-metric" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="assets" className="slate-assets" aria-labelledby="assets-heading">
        <div className="slate-assets-inner">
          <div className="slate-assets-heading">
            <h2 id="assets-heading">Assets &amp; One-Sheets</h2>
          </div>
          <div className="slate-assets-list">
            {[
              ...shows.map((show) => ({ label: `${show.title} — One-Sheet`, type: "PDF", file: undefined })),
              { label: "Wave Upfronts 2026 — Full Deck", type: "PDF", file: undefined },
              { label: "Wave Network Overview", type: "PDF", file: undefined },
              { label: "Audience & Reach Report", type: "PDF", file: undefined },
              { label: "2026 Advertising Opportunities", type: "PDF", file: undefined },
            ].map((asset) => (
              <div className="slate-asset-row" key={asset.label}>
                <button
                  type="button"
                  className={`slate-asset-download${downloadedAssets.has(asset.label) ? " is-downloaded" : ""}`}
                  disabled={!asset.file}
                  onClick={() => downloadAsset(asset.label, asset.file)}
                  aria-label={asset.file ? `Download ${asset.label}` : `${asset.label} upload pending`}
                  title={asset.file ? "Download asset" : "Upload pending"}
                >
                  <img className="asset-download-arrow" src="/assets/Download Arrow@3x.png" alt="" draggable={false} />
                  <img className="asset-download-complete" src="/assets/Download Arrow Complete@3x.png" alt="" draggable={false} />
                </button>
                <span className="slate-asset-title">{asset.label}</span>
                <span className="slate-asset-type">{asset.file ? asset.type : "UPLOAD PENDING"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .slate-page {
          --slate-bg: #000000;
          --slate-ink: #f4f5f0;
          height: 100vh;
          min-height: 100vh;
          overflow-x: hidden;
          overflow-y: auto;
          background: #000000;
          color: var(--slate-ink);
          font-family: "Zalando Sans", sans-serif;
          user-select: none;
        }
        .slate-detail {
          position: fixed;
          z-index: 30;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          background: transparent;
          clip-path: inset(var(--origin-top) var(--origin-right) var(--origin-bottom) var(--origin-left) round 30px);
          will-change: clip-path;
          animation: detail-grow .9s cubic-bezier(.16, 1, .3, 1) both;
        }
        @keyframes detail-grow {
          from { clip-path: inset(var(--origin-top) var(--origin-right) var(--origin-bottom) var(--origin-left) round 30px); }
          to { opacity: 1; clip-path: inset(0 0 0 0 round 0); }
        }
        .slate-detail-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 80% center;
          transform: scale(1.18) translateX(12%);
          transform-origin: center right;
        }
        .slate-detail-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.26) 48%, rgba(0,0,0,0) 78%), linear-gradient(0deg, rgba(0,0,0,.66) 0%, rgba(0,0,0,0) 58%);
        }
        .slate-detail.is-closing .slate-detail-image,
        .slate-detail.is-closing .slate-detail-shade {
          animation: detail-image-fade .42s .18s ease both;
        }
        @keyframes detail-image-fade {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .slate-detail-header {
          position: absolute;
          z-index: 10;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 17px 30px;
          animation: detail-chrome-in .45s .52s cubic-bezier(.16, 1, .3, 1) both;
        }
        @keyframes detail-chrome-in {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slate-detail.is-closing { animation: detail-shrink .82s .18s cubic-bezier(.16, 1, .3, 1) both; }
        .slate-detail.is-closing .slate-detail-content,
        .slate-detail.is-closing .slate-detail-header,
        .slate-detail.is-closing .slate-detail-back { animation: detail-copy-out .45s ease both; }
        @keyframes detail-shrink {
          from { clip-path: inset(0 0 0 0 round 0); }
          to { clip-path: inset(var(--origin-top) var(--origin-right) var(--origin-bottom) var(--origin-left) round 30px); }
        }
        @keyframes detail-copy-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-20px); }
        }
        .slate-detail-header > img { width: 121px; height: auto; }
        .slate-detail-header nav { display: flex; align-items: center; gap: 28px; font: 400 12px "Pragmatica Book", "Zalando Sans", sans-serif; letter-spacing: -.025em; color: #fff; mix-blend-mode: difference; }
        .slate-detail-header nav button { border: 0; border-radius: 999px; padding: 5px 16px; background: #e3f643; color: #0b0909; font: 700 12px "Zalando Sans", sans-serif; letter-spacing: -.025em; cursor: pointer; mix-blend-mode: normal; }
        .slate-page.detail-nav-dark .slate-detail-header nav {
          color: #0b0909;
          mix-blend-mode: normal;
        }
        .slate-page.detail-nav-dark .slate-detail-header nav > a,
        .slate-page.detail-nav-dark .slate-detail-header nav > span:not(.slate-nav-indicator) {
          color: #0b0909;
          mix-blend-mode: normal;
        }
        .slate-detail-back {
          position: absolute;
          top: 120px;
          left: 30px;
          display: inline-flex;
          align-items: center;
          width: 112px;
          height: 33px;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          animation: detail-chrome-in .45s .58s cubic-bezier(.16, 1, .3, 1) both;
        }
        .slate-detail-back img { display: block; width: 100%; height: 100%; object-fit: contain; }
        .slate-detail-back { position: absolute; overflow: hidden; }
        .explore-label { position: relative; overflow: hidden; }
        .explore-outline-text,
        .explore-outline-art { transition: opacity .22s ease; }
        .explore-outline-art { position: relative; z-index: 1; }
        .back-outline-art { opacity: 1; transition: opacity .22s ease; }
        .pill-fill-art {
          position: absolute !important;
          inset: 0;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          opacity: 0;
          transition: opacity .22s ease;
          pointer-events: none;
          z-index: 2;
        }
        .slate-detail-back:hover .back-outline-art,
        .slate-detail-back:focus-visible .back-outline-art { opacity: 0; }
        .slate-detail-back:hover .pill-fill-art,
        .slate-detail-back:focus-visible .pill-fill-art,
        .explore-label:hover .pill-fill-art,
        .explore-label:focus-visible .pill-fill-art { opacity: 1; }
        .explore-label:hover .explore-outline-text,
        .explore-label:hover .explore-outline-art,
        .explore-label:focus-visible .explore-outline-text,
        .explore-label:focus-visible .explore-outline-art { opacity: 0; }
        .explore-label:hover,
        .explore-label:focus-visible {
          border-color: transparent;
          background: transparent;
          color: transparent;
        }
        .slate-detail-content {
          position: absolute;
          left: 30px;
          top: clamp(220px, 31vh, 300px);
          bottom: auto;
          width: min(620px, calc(100vw - 60px));
          animation: detail-copy-in .62s .58s cubic-bezier(.16, 1, .3, 1) both;
        }
        @keyframes detail-copy-in {
          from { opacity: 0; transform: translateX(-34px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .slate-detail-category, .slate-detail-tags, .slate-detail-specs span { font: 700 10px "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-detail-category { display: none; margin-bottom: 14px; color: rgba(244,245,240,.8); }
        .slate-detail-content h1 { margin: 0; font: 700 clamp(42px, 6vw, 88px)/.9 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-detail-talent { margin: 20px 0 0; font: 500 clamp(24px, 3vw, 42px)/1 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-detail-tags { display: flex; gap: 22px; margin-top: 34px; color: rgba(244,245,240,.72); }
        .slate-detail-description { max-width: 500px; margin: 32px 0 0; color: rgba(244,245,240,.88); font-size: 16px; line-height: 1.3; }
        .slate-detail-specs { display: flex; gap: 42px; margin-top: 78px; }
        .slate-detail-specs div { display: grid; gap: 8px; }
        .slate-detail-specs span { color: rgba(244,245,240,.58); }
        .slate-detail-specs strong { max-width: 180px; white-space: pre-line; font: 500 13px/1.2 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-header, .slate-footer {
          position: fixed;
          z-index: 10;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 17px 30px;
          font-family: "Pragmatica Book", "Zalando Sans", sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: -0.025em;
        }
        .slate-header { top: 0; }
        .slate-footer { bottom: 0; justify-content: flex-end; color: rgba(244, 245, 240, .62); }
        .slate-page.has-detail > .slate-header,
        .slate-page.has-detail > .slate-footer {
          opacity: 0;
        }
        .slate-page.has-detail .frame-brand,
        .slate-page.has-detail .slate-accolades {
          opacity: 0;
        }
        .slate-page.is-returning .slate-card-info {
          animation: detail-copy-in .62s cubic-bezier(.16, 1, .3, 1) both;
        }
        .slate-page.is-returning:not(.has-detail) .frame-brand,
        .slate-page.is-returning:not(.has-detail) .slate-accolades {
          animation: detail-copy-in .62s cubic-bezier(.16, 1, .3, 1) both;
          opacity: 1;
        }
        .slate-mark { width: 121px; height: auto; }
        .slate-nav,
        .slate-detail-header nav {
          position: relative;
          display: flex;
          align-items: center;
          gap: 29px;
          color: #fff;
          mix-blend-mode: difference;
        }
        .slate-nav button,
        .slate-detail-header nav button { mix-blend-mode: normal; }
        .slate-nav a {
          position: relative;
          color: inherit;
          text-decoration: none;
        }
        .slate-nav > a,
        .slate-nav > span:not(.slate-nav-indicator),
        .slate-detail-header nav > a,
        .slate-detail-header nav > span:not(.slate-nav-indicator) {
          color: #fff;
          mix-blend-mode: difference;
        }
        .slate-nav-active::after {
          content: none;
        }
        .slate-nav-indicator {
          position: absolute;
          bottom: -7px;
          left: 0;
          height: 2px;
          background: #e3f643;
          transition: left .42s cubic-bezier(.16,1,.3,1), width .42s cubic-bezier(.16,1,.3,1);
          pointer-events: none;
        }
        .slate-rsvp {
          border: 0;
          border-radius: 999px;
          background: #e3f643;
          color: #0b0909;
          padding: 5px 16px;
          font: 700 12px "Zalando Sans", sans-serif;
          letter-spacing: -.025em;
          cursor: pointer;
        }
        .slate-stage { height: 100vh; padding-top: 55px; padding-bottom: 57px; }
        .slate-audience {
          min-height: 520px;
          padding: 112px 30px 140px;
          background: linear-gradient(180deg, #000000 0%, #212922 100%);
          color: var(--slate-ink);
        }
        .slate-audience-inner { max-width: 1200px; margin: 0 auto; }
        .slate-audience-heading {
          display: flex;
          align-items: baseline;
          gap: 32px;
          padding-bottom: 28px;
          border-bottom: 1px solid rgba(244,245,240,.3);
        }
        .slate-audience-heading h2 {
          margin: 0;
          font: 700 clamp(28px, 5vw, 66px)/.9 "Zalando Sans Expanded", sans-serif;
          letter-spacing: -.025em;
          text-align: left;
        }
        .slate-asset-title { flex: 1; }
        .slate-audience-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .slate-audience-metric {
          min-height: 190px;
          padding: 34px 24px 24px 0;
          border-bottom: 1px solid rgba(244,245,240,.18);
          text-align: center;
        }
        .slate-audience-metric + .slate-audience-metric { padding-left: 24px; border-left: 1px solid rgba(244,245,240,.18); }
        .slate-audience-metric strong {
          display: block;
          margin-bottom: 22px;
          color: #e3f643;
          font: 700 clamp(44px, 6vw, 82px)/.9 "Space Grotesk", sans-serif;
          letter-spacing: -.025em;
        }
        .slate-audience-metric span { display: block; color: rgba(244,245,240,.65); font: 500 10px "Zalando Sans", sans-serif; letter-spacing: .04em; }
        .slate-assets {
          min-height: 520px;
          padding: 112px 30px 140px;
          background: linear-gradient(180deg, #212922 0%, #000000 100%);
          color: var(--slate-ink);
        }
        .slate-assets-inner { max-width: 1200px; margin: 0 auto; }
        .slate-assets-heading { padding-bottom: 28px; border-bottom: 1px solid rgba(244,245,240,.3); }
        .slate-assets-heading h2 {
          margin: 0;
          font: 700 clamp(28px, 5vw, 66px)/.9 "Zalando Sans Expanded", sans-serif;
          letter-spacing: -.025em;
        }
        .slate-assets-list { margin-top: 24px; }
        .slate-asset-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          min-height: 52px;
          padding: 9px 0;
          border-bottom: 1px solid rgba(244,245,240,.2);
          font: 500 15px "Zalando Sans", sans-serif;
          text-align: left;
        }
        .slate-asset-download {
          flex: 0 0 30px;
          width: 30px;
          height: 30px;
          border: 1px solid rgba(244,245,240,.75);
          border-radius: 50%;
          background: transparent;
          color: #f4f5f0;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background-color .22s ease, border-color .22s ease, color .22s ease;
        }
        .slate-asset-download img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .22s ease; }
        .asset-download-arrow { opacity: 1; }
        .asset-download-complete { opacity: 0; }
        .slate-asset-download:hover:not(:disabled) { background: #e3f643; border-color: #e3f643; color: #0b0909; }
        .slate-asset-download.is-downloaded { background: transparent; border-color: transparent; }
        .slate-asset-download.is-downloaded .asset-download-arrow { opacity: 0; }
        .slate-asset-download.is-downloaded .asset-download-complete { opacity: 1; }
        .slate-asset-download:disabled { opacity: .45; cursor: not-allowed; }
        .slate-asset-type {
          flex-shrink: 0;
          margin-left: auto;
          color: rgba(244,245,240,.55);
          font: 700 10px "Zalando Sans Expanded", sans-serif;
          letter-spacing: -.025em;
        }
        .slate-rail {
          display: flex;
          align-items: center;
          gap: 28px;
          height: 100%;
          padding: 0 0;
          overflow-x: auto;
          overflow-y: hidden;
          cursor: url("/assets/Swipe Cursor.svg") 32 32, grab;
          scrollbar-width: none;
          touch-action: pan-x;
        }
        .slate-rail::-webkit-scrollbar { display: none; }
        .slate-rail.is-dragging { cursor: url("/assets/Swipe Cursor.svg") 32 32, grabbing; }
        .slate-spacer { flex: 0 0 calc((100vw - min(90vw, 1200px)) / 2); }
        .slate-card {
          position: relative;
          flex: 0 0 min(90vw, 1200px);
          aspect-ratio: 16 / 10;
          height: auto;
          --card-lift: 28px;
          --card-scale: .92;
          opacity: var(--parallax-opacity, .36);
          transform: translate3d(0, var(--card-lift), 0) rotateY(var(--parallax-rotate, 0deg)) scale(var(--card-scale));
          transition: opacity .25s ease;
          will-change: transform, opacity, filter;
        }
        .slate-card.is-active { --card-lift: 0px; --card-scale: 1; }
        .slate-page.has-detail .slate-card-info { opacity: 0; transition: opacity .28s ease; }
        .slate-frame {
          position: absolute;
          inset: 0;
          border-radius: 30px;
          background: #b5b5b5;
          overflow: hidden;
          border: 0;
          filter: blur(var(--card-blur, 0px)) saturate(var(--card-saturation, 1));
          transform: translate3d(calc(var(--parallax-x, 0px) * .42), 0, 0) scale(1.045);
          transition: none;
          will-change: filter, transform;
        }
        .slate-image {
          position: absolute;
          inset: -2px;
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          object-fit: cover;
          object-position: center;
          transform: translate3d(calc(var(--parallax-x, 0px) * .78), 0, 0) scale(1.08);
          transition: none;
          will-change: transform;
        }
        .slate-frame::after {
          content: "";
          position: absolute;
          z-index: 2;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%);
          pointer-events: none;
        }
        .slate-frame::before {
          content: "";
          position: absolute;
          z-index: 1;
          inset: 0;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,var(--glass-opacity, 0));
          backdrop-filter: blur(var(--glass-blur, 0px)) saturate(125%);
          -webkit-backdrop-filter: blur(var(--glass-blur, 0px)) saturate(125%);
          opacity: 1;
          transition: background .55s ease, border-color .55s ease;
          pointer-events: none;
        }
        .frame-brand {
          position: absolute;
          z-index: 3;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: -.025em;
        }
        .frame-brand { top: 30px; right: 32px; width: 150px; height: auto; transform: translate3d(calc(var(--parallax-x, 0px) * -0.62), 0, 0); transition: none; }
        .frame-brand-wave { width: 95px; }
        .slate-accolades {
          position: absolute;
          z-index: 3;
          top: 30px;
          left: 18px;
          width: 190px;
          display: grid;
          justify-items: center;
          gap: 24px;
          color: #fff;
          text-align: center;
          filter: blur(var(--card-blur, 0px)) saturate(var(--card-saturation, 1));
          transform: translate3d(calc(var(--parallax-x, 0px) * -.62), 0, 0);
          will-change: transform, filter;
        }
        .slate-accolade-group { display: grid; justify-items: center; gap: 14px; }
        .slate-accolade-group > img {
          width: 104px;
          height: auto;
          object-fit: contain;
        }
        .slate-accolade-list {
          display: grid;
          gap: 17px;
          width: 100%;
          font-family: "IBM Plex Serif", Georgia, serif;
        }
        .slate-accolade { display: grid; gap: 3px; }
        .slate-accolade span { font-size: 11px; line-height: 1; }
        .slate-accolade strong { display: grid; font-size: 14px; font-weight: 500; line-height: 1.02; }
        .slate-accolade em { font-style: normal; }
        .slate-card-info {
          position: absolute;
          z-index: 3;
          right: 38px;
          bottom: 38px;
          left: 38px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          filter: blur(var(--card-blur, 0px)) saturate(var(--card-saturation, 1));
          transform: translate3d(calc(var(--parallax-x, 0px) * -.72), calc(var(--card-lift, 0px) * -.16), 0) translateX(calc(var(--scroll-lag, 0px) * 1.8)) scale(calc(1 + (var(--card-scale, .92) - 1) * .08));
          transition: none;
          will-change: transform, filter;
        }
        .slate-category { display: none; }
        .slate-card h1 { max-width: 740px; margin: 0; font-family: "Zalando Sans Expanded", sans-serif; font-size: clamp(32px, 5vw, 76px); font-weight: 700; letter-spacing: -.025em; line-height: .92; }
        .slate-card-info p { margin: 10px 0 0; font-size: 10px; font-weight: 700; letter-spacing: -.025em; line-height: 1; color: rgba(244,245,240,.82); }
        .slate-card-info p.slate-talent { margin-top: 12px; font-family: "Zalando Sans Expanded", sans-serif; font-size: clamp(22px, 2.2vw, 34px); font-weight: 500; letter-spacing: -.025em; color: rgba(244,245,240,.95); }
        .slate-card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 15px; white-space: nowrap; font-size: 10px; font-weight: 700; letter-spacing: .04em; }
        .explore-label { display: inline-flex; align-items: center; gap: 10px; border: 2px solid rgba(244,245,240,.72); border-radius: 999px; padding: 7px 11px 7px 13px; background: transparent; color: inherit; font-family: "Zalando Sans Expanded", sans-serif; font-size: 10px; font-weight: 700; letter-spacing: -.025em; cursor: pointer; }
        .explore-label img { width: 16px; height: 11px; }
        @media (max-width: 700px) {
          .slate-header, .slate-footer { padding: 16px 18px; }
          .slate-nav, .slate-detail-header nav { gap: 12px; }
          .slate-footer span:first-child { display: none; }
          .slate-stage { padding-top: 48px; padding-bottom: 50px; }
          .slate-audience { padding: 80px 18px 100px; }
          .slate-audience-heading { display: block; }
          .slate-audience-heading h2 { margin-top: 0; }
          .slate-audience-metrics { grid-template-columns: repeat(2, 1fr); }
          .slate-audience-metric { min-height: 150px; padding-top: 28px; }
          .slate-audience-metric + .slate-audience-metric { padding-left: 16px; }
          .slate-audience-metric strong { margin-bottom: 16px; }
          .slate-assets { padding: 80px 18px 100px; }
          .slate-asset-row { align-items: flex-start; flex-direction: column; gap: 8px; }
          .slate-rail { gap: 16px; }
          .slate-spacer { flex-basis: 10vw; }
          .slate-card { flex-basis: 92vw; aspect-ratio: 16 / 10; height: auto; }
          .slate-card-info { right: 20px; bottom: 20px; left: 20px; flex-direction: column; align-items: flex-start; }
          .slate-card-meta { flex-direction: row; align-items: center; }
          .slate-frame { border-radius: 22px; }
          .frame-brand { top: 22px; right: 22px; }
          .slate-accolades { top: 22px; left: 22px; width: 145px; gap: 16px; }
          .slate-accolade-group { gap: 9px; }
          .slate-accolade-group > img { width: 78px; }
          .slate-accolade-list { gap: 10px; }
          .slate-accolade span { font-size: 8px; }
          .slate-accolade strong { font-size: 10px; }
          .slate-footer { font-size: 8px; }
          .slate-detail-back { top: 100px; left: 18px; width: 112px; height: 33px; }
          .slate-detail-header { padding: 16px 18px; }
          .slate-detail-header > img { width: 92px; }
          .slate-detail-header nav { gap: 12px; }
          .slate-detail-header nav span:nth-child(2), .slate-detail-header nav span:nth-child(3) { display: none; }
          .slate-detail-image { object-position: 72% center; transform: scale(1.04) translateX(1%); }
          .slate-detail-content { top: 175px; left: 18px; bottom: auto; width: calc(100vw - 36px); max-height: calc(100dvh - 200px); overflow-y: auto; }
          .slate-detail-description { font-size: 14px; }
          .slate-detail-specs { gap: 18px; flex-wrap: wrap; margin-top: 28px; }
        }
      `}</style>
    </main>
  );
}
