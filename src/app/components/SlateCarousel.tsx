"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RsvpModal from "./RsvpModal";
import { trackEvent, logout } from "@/app/actions";

const arrowAsset = "/assets/Site Arrow.svg";

export type SlateItem = {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  season: string;
  slateImagePath?: string;
  detailImagePath?: string;
  detailNavTone?: string;
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
  youtubeUrl?: string | null;
  audioUrl?: string | null;
  audience?: {
    persona: string;
    genderSkew?: string;
    genderFemale?: number;
    genderMale?: number;
    ages?: { label?: string; range?: string; pct: number }[];
    races?: { label: string; pct: number }[];
    monthlyViews: string;
    followers: string;
    monthlyDownloads?: string;
    interests?: string[];
    topGeos?: string[];
    hhi100k?: string;
    hhiOver100k?: number;
    usShare?: string;
    avgWatchTime?: string;
    audienceOverlap?: string[];
  } | null;
};

type UserPrefill = { firstName: string; lastName: string; email: string; company: string; title: string };

export default function SlateCarousel({ shows, user }: { shows: SlateItem[]; user?: UserPrefill }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedShow, setExpandedShow] = useState<SlateItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<{ img: string; pdf: string } | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [activeNav, setActiveNav] = useState<"slate" | "event" | "audience" | "assets">("slate");
  const navLocked = useRef(false);
  const navLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockNav = () => {
    navLocked.current = true;
    if (navLockTimer.current) clearTimeout(navLockTimer.current);
    navLockTimer.current = setTimeout(() => { navLocked.current = false; }, 700);
  };
  const [audienceExpanded, setAudienceExpanded] = useState(false);
  const detailNavRef = useRef<HTMLElement>(null);
  const detailContentRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
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
  const eventCardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);

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

    const waitForLayout = () => {
      const cards = Array.from(rail.querySelectorAll<HTMLElement>("[data-slate-card]"));
      if (cards.length > 0 && cards[0].offsetWidth > 0) {
        updateParallax();
        onScroll();
      } else {
        requestAnimationFrame(waitForLayout);
      }
    };
    waitForLayout();

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
      requestAnimationFrame(() => rail?.dispatchEvent(new Event("scroll")));
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
  const downloadAsset = (label: string, file?: string, showId?: string) => {
    if (!file) return;
    const link = document.createElement("a");
    link.href = file;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadedAssets((current) => new Set(current).add(label));
    trackEvent("asset_download", { label, ...(showId ? { show_id: showId } : {}) }).catch(() => {});
  };

  const closeShow = () => {
    if (expandedShow) {
      trackEvent("show_close", { show_id: expandedShow.id, show_title: expandedShow.title }).catch(() => {});
    }
    setIsClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setExpandedShow(null);
      setIsClosing(false);
      setAudienceExpanded(false);
      setLightboxUrl(null);
      setIsReturning(true);
      if (returnTimer.current) clearTimeout(returnTimer.current);
      returnTimer.current = setTimeout(() => setIsReturning(false), 700);
    }, 1000);
  };
  const selectAudience = () => {
    lockNav(); setActiveNav("audience");
    const page = document.querySelector<HTMLElement>(".slate-page");
    const audience = document.getElementById("audience");
    if (page && audience) page.scrollTo({ top: audience.offsetTop, behavior: "smooth" });
    trackEvent("nav_audience").catch(() => {});
  };
  const selectEvent = () => {
    lockNav(); setActiveNav("event");
    const page = document.querySelector<HTMLElement>(".slate-page");
    const event = document.getElementById("event");
    if (page && event) page.scrollTo({ top: event.offsetTop, behavior: "smooth" });
    trackEvent("nav_event").catch(() => {});
  };
  const selectAssets = () => {
    lockNav(); setActiveNav("assets");
    const page = document.querySelector<HTMLElement>(".slate-page");
    const assets = document.getElementById("assets");
    if (page && assets) page.scrollTo({ top: assets.offsetTop, behavior: "smooth" });
    trackEvent("nav_assets").catch(() => {});
  };
  const selectSlate = () => {
    lockNav(); setActiveNav("slate");
    const page = document.querySelector<HTMLElement>(".slate-page");
    page?.scrollTo({ top: 0, behavior: "smooth" });
    trackEvent("nav_slate").catch(() => {});
  };

  useEffect(() => {
    let rafId: number;
    const updateIndicator = () => {
      cancelAnimationFrame(rafId);
      // Double rAF: first frame commits DOM changes, second frame lets layout settle
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          const nav = expandedShow ? detailNavRef.current : siteNavRef.current;
          const target = nav?.querySelector<HTMLElement>(`.nav-${activeNav}`);
          if (!nav || !target) return;
          const navRect = nav.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          setNavIndicator({ left: targetRect.left - navRect.left, width: targetRect.width });
        });
      });
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => { window.removeEventListener("resize", updateIndicator); cancelAnimationFrame(rafId); };
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
    trackEvent("show_view", { show_id: show.id, show_title: show.title }).catch(() => {});
  };

  useEffect(() => {
    if (!expandedShow) return;
    // Reset scroll position and audience state when a new show opens
    setAudienceExpanded(false);
    const body = document.querySelector<HTMLElement>(".slate-detail-scroll");
    if (body) body.scrollTop = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeShow();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedShow]);

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".slate-page");
    if (!page) return;
    const update = () => {
      if (expandedShow || navLocked.current) return;
      const vh = window.innerHeight;
      const stage = stageRef.current;
      const eventEl = document.getElementById("event");
      const assetsEl = document.getElementById("assets");
      const candidates: Array<[HTMLElement, "slate" | "event" | "assets"]> = [];
      if (stage) candidates.push([stage, "slate"]);
      if (eventEl) candidates.push([eventEl, "event"]);
      if (assetsEl) candidates.push([assetsEl, "assets"]);
      let bestNav: "slate" | "event" | "assets" = "slate";
      let bestVisible = -Infinity;
      candidates.forEach(([el, nav]) => {
        const rect = el.getBoundingClientRect();
        const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
        if (visible > bestVisible) { bestVisible = visible; bestNav = nav; }
      });
      setActiveNav(bestNav);
    };
    page.addEventListener("scroll", update, { passive: true });
    update();
    return () => page.removeEventListener("scroll", update);
  }, [expandedShow]);

  useEffect(() => {
    const card = eventCardRef.current;
    if (!card) return;

    // Fade-in animation
    const animObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { card.classList.add("is-visible"); animObserver.disconnect(); } },
      { threshold: 0.12 }
    );
    animObserver.observe(card);

    // Gentle snap after scroll settles
    const page = card.closest<HTMLElement>(".slate-page");
    if (!page) return () => animObserver.disconnect();

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const cardRect = card.getBoundingClientRect();
        const pageHeight = page.clientHeight;
        const visibleTop = Math.max(cardRect.top, 0);
        const visibleBottom = Math.min(cardRect.bottom, pageHeight);
        const visibleHeight = visibleBottom - visibleTop;
        const visibleRatio = cardRect.height > 0 ? visibleHeight / cardRect.height : 0;

        // Only nudge when card is partially in view (20–85%) — not when fully visible or just entering
        if (visibleRatio > 0.2 && visibleRatio < 0.85) {
          const cardCenter = cardRect.top + cardRect.height / 2;
          const viewCenter = pageHeight / 2;
          const delta = cardCenter - viewCenter;
          if (Math.abs(delta) > 30) {
            page.scrollBy({ top: delta, behavior: "smooth" });
          }
        }
      }, 160);
    };

    page.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      animObserver.disconnect();
      page.removeEventListener("scroll", onScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const scroller = stage.closest<HTMLElement>(".slate-page") ?? window as unknown as HTMLElement;
    let rafId: number | null = null;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const ratio = Math.max(0, Math.min(1, rect.bottom / vh));
      const blurStart = 0.4;
      if (ratio >= blurStart) {
        stage.style.setProperty("--rail-blur", "0px");
        stage.style.setProperty("--rail-opacity", "1");
      } else {
        const t = 1 - ratio / blurStart;
        stage.style.setProperty("--rail-blur", `${(t * 16).toFixed(1)}px`);
        stage.style.setProperty("--rail-opacity", `${(1 - t * 0.62).toFixed(3)}`);
      }
    };
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { scroller.removeEventListener("scroll", onScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, []);

  return (
    <main className={`slate-page${expandedShow ? " has-detail" : ""}${isReturning ? " is-returning" : ""}${expandedShow?.detailNavTone === "dark" ? " detail-nav-dark" : ""}`}>
      <RsvpModal user={user} />
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
          {expandedShow.detailImagePath && (
            <img className="slate-detail-image slate-detail-image-crossfade" src={expandedShow.detailImagePath} alt="" />
          )}
          <div className="slate-detail-shade" />
          <header className="slate-detail-header">
            <img src="/assets/Wave Logo.svg" alt="Wave Sports & Entertainment" />
            <nav ref={detailNavRef} aria-label="Show navigation">
              <button type="button" className={`nav-slate${activeNav === "slate" ? " slate-nav-active" : ""}`} onClick={() => { closeShow(); setActiveNav("slate"); }}>SLATE</button>
              <button type="button" className={`nav-event${activeNav === "event" ? " slate-nav-active" : ""}`} onClick={() => { closeShow(); setTimeout(selectEvent, 350); }}>EVENT</button>
              <button type="button" className={`nav-assets${activeNav === "assets" ? " slate-nav-active" : ""}`} onClick={() => { closeShow(); setTimeout(selectAssets, 350); }}>ASSETS</button>
              <span className="slate-nav-indicator" style={{ transform: `translateX(${navIndicator.left}px)`, width: navIndicator.width }} />
              <form action={logout} style={{ display: "contents" }}>
                <button type="submit" className="slate-logout">Log Out</button>
              </form>
            </nav>
          </header>
          <button className="slate-detail-back" type="button" onClick={closeShow} aria-label="Back" title="Back">
            <img className="back-outline-art" src="/assets/Back Arrow@3x.png" alt="" draggable={false} />
            <img className="pill-fill-art" src="/assets/Back Fill.png" alt="" draggable={false} />
          </button>
          <div className={`slate-detail-body${audienceExpanded ? " audience-open" : ""} show-${expandedShow.id}`}>
          <div className="slate-detail-fixed">
            <span className="slate-detail-category">{expandedShow.category}</span>
            <h1>{expandedShow.id === "ngl" ? "Not Gonna Lie" : expandedShow.title}</h1>
            <p className="slate-detail-talent">{expandedShow.talent ?? expandedShow.category}</p>
          </div>
          <div className="slate-detail-scroll" ref={detailScrollRef}>
          <div className="slate-detail-info">
            <div className="slate-detail-tags">
              {(expandedShow.detailTopics ?? [expandedShow.category]).map((topic) => <span key={topic}>{topic}</span>)}
            </div>
            <p className="slate-detail-description">{expandedShow.detailDescription ?? expandedShow.description ?? expandedShow.tagline}</p>
            {(() => {
              const oneSheets: Record<string, string> = {
                "ngl": "/assets/one-sheets/Not Gonna Lie w_ Kylie Kelce _ One Sheet 2026.pdf",
                "bad-friends": "/assets/one-sheets/Bad Friends _ One Sheet 2026.pdf",
                "whiskey-ginger": "/assets/one-sheets/Whiskey Ginger with Andrew Santino _ One Sheet 2026.pdf",
                "almost-athletes": "/assets/one-sheets/Almost Athletes _ One Sheet 2026.pdf",
                "open-thoughts": "/assets/one-sheets/Open Thoughts _ One Sheet 2026.pdf",
                "wingmen": "/assets/one-sheets/Wingmen with Matthew & Brady Tkachuk _ One Sheet 2026.pdf",
                "7pm-brooklyn": "/assets/one-sheets/7PM in Brooklyn _ One Sheet 2026.pdf",
                "house-of-maher": "/assets/one-sheets/House of Maher _ One Sheet 2026.pdf",
                "big-bro": "/assets/one-sheets/Big Bro with Kid Cudi _ One Sheet 2026.pdf",
                "power-hour": "/assets/one-sheets/Power Hour One Sheet _ 2026.pdf",
                "my-momma-told-me": "/assets/one-sheets/My Momma Told Me One Sheet.pdf",
              };
              const showOneSheetUrl = oneSheets[expandedShow.id];
              const thumbUrl = showOneSheetUrl ? `/assets/one-sheets/thumbs/${expandedShow.id}.png` : null;
              if (!expandedShow.youtubeUrl && !expandedShow.audioUrl && !showOneSheetUrl) return null;
              return (
                <div className="slate-detail-channels">
                  {expandedShow.youtubeUrl && (
                    <a className="slate-detail-channel-btn" href={expandedShow.youtubeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); trackEvent("show_youtube", { show_id: expandedShow.id, show_title: expandedShow.title }).catch(() => {}); }}>
                      Watch
                    </a>
                  )}
                  {expandedShow.audioUrl && (
                    <a className="slate-detail-channel-btn" href={expandedShow.audioUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); trackEvent("show_spotify", { show_id: expandedShow.id, show_title: expandedShow.title }).catch(() => {}); }}>
                      Listen
                    </a>
                  )}
                  {thumbUrl && showOneSheetUrl && (
                    <button type="button" className="slate-detail-channel-btn" onClick={(e) => { e.stopPropagation(); setLightboxUrl({ img: thumbUrl, pdf: showOneSheetUrl }); trackEvent("show_onesheet", { show_id: expandedShow.id, show_title: expandedShow.title }).catch(() => {}); }}>
                      One Sheet
                    </button>
                  )}
                </div>
              );
            })()}
            <div className="slate-detail-specs">
              {expandedShow.audience ? (
                <div
                  className={`slate-detail-audience-btn${audienceExpanded ? " is-open" : ""}`}
                  onClick={() => {
                    const next = !audienceExpanded;
                    setAudienceExpanded(next);
                    if (next) {
                      trackEvent("audience_expand", { show_id: expandedShow.id, show_title: expandedShow.title }).catch(() => {});
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          const scroll = detailScrollRef.current;
                          const target = detailContentRef.current;
                          if (!scroll || !target) return;
                          const start = scroll.scrollTop;
                          const end = target.offsetTop - 24;
                          const dist = end - start;
                          if (Math.abs(dist) < 4) return;
                          const duration = 480;
                          let t0: number | null = null;
                          const step = (ts: number) => {
                            if (t0 === null) t0 = ts;
                            const elapsed = ts - t0;
                            const p = Math.min(elapsed / duration, 1);
                            const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                            scroll.scrollTop = start + dist * ease;
                            if (p < 1) requestAnimationFrame(step);
                          };
                          requestAnimationFrame(step);
                        });
                      });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const next = !audienceExpanded;
                    setAudienceExpanded(next);
                    if (next) trackEvent("audience_expand", { show_id: expandedShow.id, show_title: expandedShow.title }).catch(() => {});
                  }}
                >
                  <span>AUDIENCE</span>
                  <strong>{audienceExpanded ? "COLLAPSE ↑" : "VIEW DATA ↓"}</strong>
                </div>
              ) : (
                <div><span>DEMOGRAPHICS</span><strong>{expandedShow.detailDemographics ?? expandedShow.demo ?? "MIXED"}</strong></div>
              )}
              <div><span>CADENCE</span><strong>{expandedShow.detailCadence ?? "WEEKLY"}</strong></div>
              <div><span>FORMAT</span><strong>{expandedShow.detailFormat ?? expandedShow.specs ?? "WAVE ORIGINALS"}</strong></div>
            </div>
          </div>
          {audienceExpanded && expandedShow.audience && (() => {
              const aud = expandedShow.audience!;
              const isMaleFirst = aud.genderSkew?.toLowerCase().endsWith("male") && !aud.genderSkew?.toLowerCase().endsWith("female");
              const gskewA = aud.genderSkew ? parseInt(aud.genderSkew) : null;
              const gskewB = aud.genderSkew ? parseInt(aud.genderSkew.split("/")[1]) : null;
              const gF = aud.genderFemale ?? (isMaleFirst ? gskewB : gskewA);
              const gM = aud.genderMale ?? (isMaleFirst ? gskewA : gskewB);
              return (
                <div ref={detailContentRef} className="slate-detail-audience-drawer">
                  <div className="detail-audience">
                  <div className="detail-audience-stats">
                    <div className="detail-stat"><strong>{aud.monthlyViews}</strong><span>Monthly Views</span></div>
                    <div className="detail-stat"><strong>{aud.followers}</strong><span>Total Followers</span></div>
                    {aud.monthlyDownloads && <div className="detail-stat"><strong>{aud.monthlyDownloads}</strong><span>Monthly Downloads</span></div>}
                    {aud.hhi100k && <div className="detail-stat"><strong>{aud.hhi100k}</strong><span>HHI $100K+</span></div>}
                  </div>
                  {(gF != null || gM != null || (aud.ages && aud.ages.length > 0) || (aud.topGeos && aud.topGeos.length > 0)) && (
                    <div className="detail-audience-demo">
                      {(gF != null || gM != null) && (
                        <div className="detail-demo-gender">
                          <span className="detail-demo-label">GENDER</span>
                          <div className="detail-gender-bars">
                            {gF != null && <div className="detail-gender-row"><span>F</span><div className="detail-gender-track"><div className={`detail-gender-fill${(gM != null && gM > gF) ? " detail-gender-fill-dim" : ""}`} style={{ width: `${gF}%` }} /></div><span>{gF}%</span></div>}
                            {gM != null && <div className="detail-gender-row"><span>M</span><div className="detail-gender-track"><div className={`detail-gender-fill${(gF != null && gF > gM) ? " detail-gender-fill-dim" : ""}`} style={{ width: `${gM}%` }} /></div><span>{gM}%</span></div>}
                          </div>
                        </div>
                      )}
                      {aud.ages && aud.ages.length > 0 && (
                        <div className="detail-demo-age">
                          <span className="detail-demo-label">AGE</span>
                          <div className="detail-age-bars">
                            {aud.ages.map((a) => { const k = a.label ?? a.range ?? String(a.pct); return (
                              <div className="detail-age-row" key={k}><span>{k}</span><div className="detail-age-track"><div className="detail-age-fill" style={{ width: `${Math.min(a.pct * 2, 100)}%` }} /></div><span>{a.pct.toFixed(0)}%</span></div>
                            );})}
                          </div>
                        </div>
                      )}
                      {aud.races && aud.races.length > 0 && (
                        <div className="detail-demo-race">
                          <span className="detail-demo-label">RACE / ETHNICITY</span>
                          <div className="detail-age-bars">
                            {[...aud.races].sort((a, b) => b.pct - a.pct).slice(0, 5).map((r) => (
                              <div className="detail-race-row" key={r.label}>
                                <span className="detail-race-label">{r.label}</span>
                                <div className="detail-race-track"><div className="detail-age-fill" style={{ width: `${Math.min(r.pct * 2, 100)}%` }} /></div>
                                <span className="detail-race-pct">{r.pct % 1 === 0 ? r.pct : r.pct.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {(aud.interests?.length || aud.topGeos?.length) ? (
                    <div className="detail-audience-geos">
                      <span className="detail-demo-label">{aud.interests?.length ? "TOP INTERESTS" : "TOP MARKETS"}</span>
                      <div className="detail-geo-list">{(aud.interests ?? aud.topGeos)!.map((g) => <span key={g}>{g}</span>)}</div>
                    </div>
                  ) : null}
                  </div>
                </div>
              );
            })()}
          </div>
          </div>
        </section>
      )}
      <header className="slate-header">
        <img className="slate-mark" src="/assets/Wave Logo.svg" alt="Wave Sports & Entertainment" />
        <nav ref={siteNavRef} className="slate-nav" aria-label="Site navigation">
          <button type="button" className={`nav-slate${activeNav === "slate" ? " slate-nav-active" : ""}`} onClick={selectSlate}>SLATE</button>
          <button type="button" className={`nav-event${activeNav === "event" ? " slate-nav-active" : ""}`} onClick={selectEvent}>EVENT</button>
          <button type="button" className={`nav-assets${activeNav === "assets" ? " slate-nav-active" : ""}`} onClick={selectAssets}>ASSETS</button>
          <span className="slate-nav-indicator" style={{ transform: `translateX(${navIndicator.left}px)`, width: navIndicator.width }} />
          <form action={logout} style={{ display: "contents" }}>
            <button type="submit" className="slate-logout">Log Out</button>
          </form>
        </nav>
      </header>

      <section ref={stageRef} className="slate-stage" aria-label="Wave 2026 slate">
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
              data-color={show.categoryColor}
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

      <section id="event" className="slate-event-section">
        <div className="slate-event-inner">
          <div ref={eventCardRef} className="slate-event-card">
            <img className="slate-event-bg" src="/assets/altman-building.jpg" alt="The Altman Building" />
            <div className="slate-event-overlay" />
            <div className="slate-event-content">
              <span className="slate-event-eyebrow">Wave Upfronts 2027</span>
              <h2 className="slate-event-date">Tuesday, October<br />27th, 2026</h2>
              <p className="slate-event-venue">
                <img src="/assets/location-pin.svg" alt="" aria-hidden="true" width="20" height="26" style={{ flexShrink: 0, marginTop: 2 }} />
                The Altman Building
              </p>
              <div className="slate-event-actions">
                <a className="slate-event-btn" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wave+Upfronts+2027&dates=20261027T213000Z/20261028T010000Z&details=Wave+Upfronts+2027&location=The+Altman+Building,+135+West+18th+Street,+New+York,+NY+10011" target="_blank" rel="noopener noreferrer">Add to Calendar</a>
                <a className="slate-event-btn" href="https://maps.google.com/?q=135+West+18th+Street+New+York+NY+10011" target="_blank" rel="noopener noreferrer">Get Directions</a>
              </div>
            </div>
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
              ...shows.map((show) => {
                const oneSheets: Record<string, string> = {
                  "ngl": "/assets/one-sheets/Not Gonna Lie w_ Kylie Kelce _ One Sheet 2026.pdf",
                  "bad-friends": "/assets/one-sheets/Bad Friends _ One Sheet 2026.pdf",
                  "whiskey-ginger": "/assets/one-sheets/Whiskey Ginger with Andrew Santino _ One Sheet 2026.pdf",
                  "almost-athletes": "/assets/one-sheets/Almost Athletes _ One Sheet 2026.pdf",
                  "open-thoughts": "/assets/one-sheets/Open Thoughts _ One Sheet 2026.pdf",
                  "wingmen": "/assets/one-sheets/Wingmen with Matthew & Brady Tkachuk _ One Sheet 2026.pdf",
                  "7pm-brooklyn": "/assets/one-sheets/7PM in Brooklyn _ One Sheet 2026.pdf",
                  "house-of-maher": "/assets/one-sheets/House of Maher _ One Sheet 2026.pdf",
                  "big-bro": "/assets/one-sheets/Big Bro with Kid Cudi _ One Sheet 2026.pdf",
                  "power-hour": "/assets/one-sheets/Power Hour One Sheet _ 2026.pdf",
                  "my-momma-told-me": "/assets/one-sheets/My Momma Told Me One Sheet.pdf",
                };
                return { label: `${show.title} — One-Sheet`, type: "PDF", file: oneSheets[show.id], showId: show.id };
              }),
              { label: "Wave Upfronts 2026 — Full Deck", type: "PDF", file: undefined, showId: undefined },
              { label: "Wave Network Overview", type: "PDF", file: undefined, showId: undefined },
              { label: "Audience & Reach Report", type: "PDF", file: undefined, showId: undefined },
              { label: "2026 Advertising Opportunities", type: "PDF", file: undefined, showId: undefined },
            ].map((asset) => (
              <div className="slate-asset-row" key={asset.label}>
                <button
                  type="button"
                  className={`slate-asset-download${downloadedAssets.has(asset.label) ? " is-downloaded" : ""}`}
                  disabled={!asset.file}
                  onClick={() => downloadAsset(asset.label, asset.file, asset.showId)}
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
        @keyframes slate-page-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .slate-page {
          animation: slate-page-in 0.3s ease-out both;
        }
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
        .slate-detail-image-crossfade {
          animation: detail-image-crossfade 1.4s 0.05s ease-in-out both;
        }
        @keyframes detail-image-crossfade {
          from { opacity: 0; transform: scale(1.22) translateX(12%); }
          to   { opacity: 1; transform: scale(1.18) translateX(12%); }
        }
        .slate-detail-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.26) 48%, rgba(0,0,0,0) 78%), linear-gradient(0deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.4) 30%, rgba(0,0,0,0) 58%), linear-gradient(180deg, rgba(33,41,34,.85) 0%, rgba(33,41,34,0) 22%);
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
        .slate-detail.is-closing .slate-detail-body,
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
        .slate-detail-header nav { margin-left: auto; }
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
        .slate-detail-body {
          position: absolute;
          left: 30px;
          top: clamp(190px, 26vh, 270px);
          bottom: 40px;
          width: min(52vw, calc(100vw - 60px));
          animation: detail-copy-in .62s .58s cubic-bezier(.16, 1, .3, 1) both;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .slate-detail-body.show-open-thoughts { width: min(42vw, calc(100vw - 60px)); }
        .slate-detail-fixed { flex-shrink: 0; }
        .slate-detail-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          scrollbar-width: none;
          padding-top: 20px;
        }
        .slate-detail-scroll::-webkit-scrollbar { display: none; }
        .slate-detail-info {
          flex-shrink: 0;
        }

        @keyframes detail-copy-in {
          from { opacity: 0; transform: translateX(-34px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .slate-detail-category, .slate-detail-tags, .slate-detail-specs span { font: 700 10px "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-detail-category { display: none; margin-bottom: 14px; color: rgba(244,245,240,.8); }
        .slate-detail-fixed h1, .slate-detail-info h1 { margin: 0; font: 700 clamp(42px, 6vw, 88px)/.9 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-detail-talent { margin: 14px 0 0; font: 500 clamp(24px, 3vw, 42px)/1 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-detail-tags { display: flex; gap: 22px; margin-top: 22px; color: rgba(244,245,240,.72); }
        .slate-detail-description { max-width: 500px; margin: 20px 0 0; color: rgba(244,245,240,.88); font-size: 16px; line-height: 1.3; }
        .slate-detail-channels { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .slate-detail-channel-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(244,245,240,.25); color: rgba(244,245,240,.8); font: 600 11px/1 "Space Grotesk", monospace; letter-spacing: .04em; text-decoration: none; transition: border-color .15s, color .15s; }
        .slate-detail-channel-btn:hover { border-color: #e3f643; color: #e3f643; }
        .slate-onesheet-preview { display: block; margin-top: 20px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(244,245,240,.12); background: none; padding: 0; position: relative; transition: border-color .2s, transform .2s; max-width: 340px; cursor: pointer; }
        .slate-onesheet-preview:hover { border-color: rgba(244,245,240,.3); transform: translateY(-2px); }
        .slate-onesheet-preview img { display: block; width: 100%; height: auto; }
        .slate-onesheet-preview-label { display: flex; align-items: center; gap: 7px; padding: 10px 14px; background: rgba(15,18,15,.85); color: rgba(244,245,240,.75); font: 600 11px/1 "Space Grotesk", monospace; letter-spacing: .04em; border-top: 1px solid rgba(244,245,240,.08); transition: color .18s; }
        .slate-onesheet-preview:hover .slate-onesheet-preview-label { color: #e3f643; }

        @keyframes lb-in { from { opacity: 0; transform: scale(.96) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes lb-bg-in { from { opacity: 0; } to { opacity: 1; } }
        .onesheet-lightbox { position: fixed; inset: 0; z-index: 9999; background: rgba(11,9,9,.78); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; cursor: zoom-out; animation: lb-bg-in .8s cubic-bezier(.16,1,.3,1) both; }
        .onesheet-lightbox img { width: auto; height: 82vh; max-width: 88vw; object-fit: contain; border: 1px solid rgba(244,245,240,.1); box-shadow: 0 48px 120px rgba(0,0,0,.8); cursor: default; animation: lb-in 1.1s cubic-bezier(.16,1,.3,1) both; border-radius: 16px; }
        .onesheet-lightbox-actions { position: fixed; top: 24px; right: 24px; display: flex; align-items: center; gap: 10px; }
        .onesheet-lightbox-download { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; background: #e3f643; color: #0b0909; font: 700 11px/1 "Space Grotesk", monospace; letter-spacing: .04em; text-decoration: none; transition: opacity .15s; }
        .onesheet-lightbox-download:hover { opacity: .85; }
        .onesheet-lightbox-close { width: 36px; height: 36px; border-radius: 50%; background: rgba(244,245,240,.1); border: 1px solid rgba(244,245,240,.15); color: rgba(244,245,240,.7); font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s; }
        .onesheet-lightbox-close:hover { background: rgba(244,245,240,.18); color: #f4f5f0; }
        .slate-detail-specs { display: flex; gap: 42px; flex-wrap: wrap; padding-top: 28px; padding-bottom: 32px; }
        .slate-detail-specs div { display: grid; gap: 8px; }
        .slate-detail-specs span { color: rgba(244,245,240,.58); }
        .slate-detail-specs strong { max-width: 180px; white-space: pre-line; font: 500 13px/1.2 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; }
        .slate-detail-audience-drawer { flex-shrink: 0; animation: audience-slide-in .5s cubic-bezier(.16,1,.3,1) both; }
        .slate-detail-audience-drawer::-webkit-scrollbar { display: none; }
        @keyframes audience-slide-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .slate-detail-audience-btn { cursor: pointer; border: 1px solid rgba(227,246,67,.35); border-radius: 6px; padding: 10px 14px; transition: border-color .2s, background .2s; }
        .slate-detail-audience-btn:hover { border-color: rgba(227,246,67,.7); background: rgba(227,246,67,.06); }
        .slate-detail-audience-btn.is-open { border-color: #e3f643; background: rgba(227,246,67,.08); }
        .slate-detail-audience-btn strong { color: #e3f643 !important; font-size: 11px !important; letter-spacing: .04em; }
        .slate-detail-audience-collapse { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; border: 1px solid #e3f643; border-radius: 6px; padding: 10px 14px; background: rgba(227,246,67,.08); margin-bottom: 16px; font: 700 10px "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; color: #f4f5f0; transition: border-color .2s, background .2s; }
        .slate-detail-audience-collapse:hover { background: rgba(227,246,67,.14); }
        .slate-detail-audience-collapse strong { color: #e3f643 !important; font-size: 11px !important; letter-spacing: .04em; }
        .detail-audience { display: flex; flex-direction: column; gap: 20px; padding-top: 24px; border-top: 1px solid rgba(244,245,240,.1); }
        @keyframes audience-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .detail-audience-stats { display: flex; gap: 32px; flex-wrap: wrap; }
        .detail-stat { display: flex; flex-direction: column; gap: 5px; }
        .detail-stat strong { font: 700 clamp(16px,1.8vw,24px)/1 "Zalando Sans Expanded", sans-serif; letter-spacing: -.03em; color: #e3f643; }
        .detail-stat span { font: 600 9px/1 "Zalando Sans Expanded", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: rgba(244,245,240,.5); }
        .detail-audience-demo { display: flex; gap: 24px; align-items: flex-start; flex-wrap: nowrap; }
        .detail-demo-gender, .detail-demo-age, .detail-demo-race { display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; }
        .detail-race-row { display: flex; align-items: center; gap: 7px; font: 600 10px/1 "Zalando Sans Expanded", sans-serif; color: rgba(244,245,240,.7); }
        .detail-race-label { width: 92px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .detail-race-pct { width: 34px; text-align: right; flex-shrink: 0; }
        .detail-audience-geos { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
        .detail-geo-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .detail-demo-label { font: 700 9px/1 "Zalando Sans Expanded", sans-serif; letter-spacing: .1em; color: rgba(244,245,240,.45); }
        .detail-gender-bars, .detail-age-bars { display: flex; flex-direction: column; gap: 7px; }
        .detail-gender-row, .detail-age-row { display: flex; align-items: center; gap: 8px; font: 600 10px/1 "Zalando Sans Expanded", sans-serif; color: rgba(244,245,240,.7); }
        .detail-gender-row > span:first-child, .detail-age-row > span:first-child { width: 28px; }
        .detail-gender-row > span:last-child, .detail-age-row > span:last-child { width: 36px; text-align: right; }
        .detail-gender-track, .detail-age-track, .detail-race-track { width: 88px; height: 4px; background: rgba(244,245,240,.12); border-radius: 2px; overflow: hidden; }
        .detail-age-track { width: 100px; }
        .detail-gender-fill { height: 100%; background: #e3f643; border-radius: 2px; transition: width .4s ease; }
        .detail-gender-fill-dim { background: rgba(244,245,240,.35); }
        .detail-age-fill { height: 100%; background: #e3f643; border-radius: 2px; }
        .detail-geo-list span { display: inline-block; padding: 5px 12px; border: 1px solid rgba(244,245,240,.15); border-radius: 999px; font: 600 10px/1 "Space Grotesk", monospace; letter-spacing: .04em; color: rgba(244,245,240,.72); }
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
          animation: detail-copy-in .32s cubic-bezier(.16, 1, .3, 1) both;
        }
        .slate-page.is-returning:not(.has-detail) .frame-brand,
        .slate-page.is-returning:not(.has-detail) .slate-accolades {
          animation: detail-copy-in .32s cubic-bezier(.16, 1, .3, 1) both;
          opacity: 1;
        }
        .slate-mark { width: 121px; height: auto; }
        .slate-nav,
        .slate-detail-header nav {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(11,9,9,0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(244,245,240,0.1);
          border-radius: 999px;
          padding: 4px 6px;
        }
        .slate-nav button,
        .slate-nav a,
        .slate-detail-header nav button,
        .slate-detail-header nav a {
          border: 0;
          background: none;
          color: rgba(244,245,240,0.55);
          font: 500 11px/1 "Zalando Sans", sans-serif;
          letter-spacing: -0.025em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: color 0.15s;
          white-space: nowrap;
          position: relative;
          z-index: 1;
        }
        .slate-nav button:hover,
        .slate-nav a:hover,
        .slate-detail-header nav button:hover,
        .slate-detail-header nav a:hover { color: rgba(244,245,240,0.9); }
        .slate-nav-active {
          color: #0b0909 !important;
          position: relative;
          z-index: 1;
        }
        .slate-nav-indicator {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 0;
          border-radius: 999px;
          background: #e3f643;
          transition: transform 0.22s cubic-bezier(.16,1,.3,1), width 0.22s cubic-bezier(.16,1,.3,1);
          pointer-events: none;
          will-change: transform, width;
        }
        .slate-rsvp {
          border: 0;
          border-radius: 999px;
          background: #e3f643;
          color: #0b0909;
          padding: 6px 16px;
          font: 700 11px/1 "Space Grotesk", monospace;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity .15s;
        }
        .slate-rsvp:hover { opacity: 0.85; }
        .slate-card-channels {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          gap: 8px;
          z-index: 4;
          flex-wrap: wrap;
        }
        .slate-channel-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid rgba(250,247,244,0.35);
          background: rgba(11,9,9,0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: rgba(250,247,244,0.9);
          font: 600 10px "Space Grotesk", monospace;
          letter-spacing: 0.04em;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .slate-channel-btn:hover {
          background: rgba(227,246,67,0.15);
          border-color: rgba(227,246,67,0.6);
          color: #e3f643;
        }
        .slate-logout {
          border: 0;
          background: none;
          color: rgba(255,255,255,0.45);
          font: 400 11px "Pragmatica Book", sans-serif;
          letter-spacing: -0.025em;
          cursor: pointer;
          padding: 0;
          mix-blend-mode: normal;
        }
        .slate-logout:hover { color: rgba(255,255,255,0.75); }
        .slate-stage { height: 100vh; padding-top: 32px; padding-bottom: 17px; overflow: hidden; background: linear-gradient(180deg, #212922 0%, #000 100%); }
        .slate-stage .slate-rail { filter: blur(var(--rail-blur, 0px)); opacity: var(--rail-opacity, 1); }
        .slate-event-section { padding: 0 8.5vw 100px; background: linear-gradient(180deg, #000 0%, #212922 100%); }
        .slate-event-inner { width: 100%; }
        .slate-event-card { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 24px; overflow: hidden; display: flex; align-items: flex-end; opacity: 0; transform: translateY(110px) scale(0.93); transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1.2s cubic-bezier(.16,1,.3,1); }
        .slate-event-card.is-visible { opacity: 1; transform: translateY(0) scale(1); }
        .slate-event-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 65% center; }
        .slate-event-overlay { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 42%, rgba(0,0,0,.18) 72%, transparent 100%); }
        .slate-event-content { position: relative; z-index: 2; padding: 0 clamp(28px, 4vw, 64px) clamp(36px, 5vh, 64px); display: flex; flex-direction: column; align-items: flex-start; max-width: 55%; }
        .slate-event-eyebrow { font: 700 19px/1 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; text-transform: uppercase; color: #e3f643; margin-bottom: 16px; }
        .slate-event-date { margin: 0 0 20px; font: 500 clamp(36px, 4.6vw, 72px)/.92 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; color: #faf7f4; }
        .slate-event-venue { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 28px; font: 500 clamp(14px, 1.5vw, 20px)/1.2 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; color: rgba(244,245,240,.85); }
        .slate-event-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .slate-event-btn { display: inline-flex; align-items: center; padding: 13px 28px; border: 1px solid rgba(244,245,240,.5); border-radius: 999px; color: #faf7f4; font: 600 11px/1 "Zalando Sans Expanded", sans-serif; letter-spacing: -.025em; text-transform: uppercase; text-decoration: none; white-space: nowrap; background: transparent; transition: border-color .2s, background .2s, color .2s; }
        .slate-event-btn:hover { background: #faf7f4; border-color: #faf7f4; color: #0b0909; }
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
        .slate-asset-download:hover:not(:disabled) .asset-download-arrow { filter: invert(1); }
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
          padding: 40px 0;
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
          flex: 0 0 min(90vw, 1200px, calc((100vh - 136px) * 1.6));
          aspect-ratio: 16 / 10;
          height: auto;
          --card-lift: 28px;
          --card-scale: .92;
          opacity: var(--parallax-opacity, 1);
          transform: translate3d(0, var(--card-lift), 0) rotateY(var(--parallax-rotate, 0deg)) scale(var(--card-scale));
          transition: opacity .25s ease;
          will-change: transform, opacity, filter;
          border-radius: 30px;
          overflow: hidden;
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
          object-position: center 22%;
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
        .frame-brand { top: 40px; right: 56px; width: 150px; height: auto; transform: translate3d(calc(var(--parallax-x, 0px) * -0.62), 0, 0); transition: none; }
        .frame-brand-wave { width: 95px; }
        .slate-accolades {
          position: absolute;
          z-index: 3;
          top: 40px;
          left: 48px;
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
          /* ── Layout foundations ── */
          .slate-header, .slate-footer { padding: 16px 18px; }
          .slate-mark { width: 88px; }
          .slate-logout { display: none; }
          .slate-footer span:first-child { display: none; }
          .slate-footer { font-size: 8px; }

          /* ── Carousel ── */
          .slate-stage { height: 100dvh; padding-top: 0; padding-bottom: 0; }
          .slate-rail { height: 100dvh; gap: 16px; padding: 40px 0; }
          .slate-spacer { flex-basis: 10vw; }
          .slate-card { flex-basis: 88vw; height: calc(100dvh - 180px); aspect-ratio: auto; border-radius: 22px; }
          .slate-frame::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 55%; background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 38%, transparent 100%); z-index: 2; pointer-events: none; }
          .slate-frame { border-radius: 22px; }
          .slate-card-info { right: 18px; bottom: 18px; left: 18px; flex-direction: column; align-items: flex-start; gap: 10px; }
          .slate-card-meta { flex-direction: row; align-items: center; align-self: flex-end; }
          .frame-brand { top: 36px; right: 36px; }
          .slate-accolades { top: 36px; left: 36px; width: 130px; gap: 14px; }
          .slate-accolade-group { gap: 8px; }
          .slate-accolade-group > img { width: 72px; }
          .slate-accolade-list { gap: 9px; }
          .slate-accolade span { font-size: 8px; }
          .slate-accolade strong { font-size: 10px; }

          /* ── Detail panel ── */
          .slate-detail-header { padding: 14px 18px; }
          .slate-detail-header > img { width: 88px; }
          .slate-detail-header nav { gap: 4px; }
          .slate-detail-header nav .nav-event,
          .slate-detail-header nav .nav-assets { display: none; }
          .slate-detail-image { object-position: 70% center; transform: scale(1.06) translateX(2%); }

          /* Back button sits below header (~60px tall), leave 8px gap */
          .slate-detail-back { top: 68px; left: 18px; width: 108px; height: 32px; }

          /* Body starts below back button + 12px breathing room */
          .slate-detail-body {
            top: 118px;
            left: 18px;
            right: 18px;
            width: auto;
            bottom: max(28px, calc(env(safe-area-inset-bottom) + 16px));
          }

          /* Info block (sticky) */
          .slate-detail-info h1 { font-size: clamp(26px, 7.5vw, 40px); overflow-wrap: anywhere; line-height: 1.05; }
          .slate-detail-talent { font-size: clamp(15px, 4.5vw, 22px); }
          .slate-detail-description { font-size: 13px; line-height: 1.55; }
          .slate-detail-channels { gap: 8px; margin-top: 14px; }
          .slate-detail-channel-btn { font-size: 12px; padding: 10px 16px; }

          /* Specs row */
          .slate-detail-specs { gap: 16px; flex-wrap: wrap; margin-top: 20px; padding-bottom: 4px; }

          /* Audience data */
          .detail-audience { margin-top: 20px; gap: 16px; }
          .detail-audience-stats { gap: 20px; }
          .detail-audience-demo { flex-direction: column; gap: 20px; }
          .detail-demo-gender,
          .detail-demo-age,
          .detail-demo-race { width: 100%; }
          .detail-gender-track,
          .detail-age-track,
          .detail-race-track { width: 100%; }
          .detail-audience-geos { margin-top: 14px; }
          .detail-geo-list { flex-wrap: wrap; gap: 6px; }

          /* Float RSVP */
          .slate-float-rsvp {
            bottom: max(20px, calc(env(safe-area-inset-bottom) + 12px));
            right: max(18px, env(safe-area-inset-right));
            padding: 11px 22px;
            font-size: 11px;
          }

          /* Event section */
          .slate-event-section { padding: 0 16px 72px; }
          .slate-event-card { border-radius: 18px; aspect-ratio: 4 / 3; }
          .slate-event-date { font-size: clamp(32px, 7vw, 50px); }
          .slate-event-venue { font-size: 13px; margin-bottom: 20px; }
          .slate-event-btn { padding: 11px 20px; font-size: 10px; }
          .slate-audience { padding: 80px 18px 100px; }
          .slate-audience-heading { display: block; }
          .slate-audience-heading h2 { margin-top: 0; }
          .slate-audience-metrics { grid-template-columns: repeat(2, 1fr); }
          .slate-audience-metric { min-height: 150px; padding-top: 28px; }
          .slate-audience-metric + .slate-audience-metric { padding-left: 16px; }
          .slate-audience-metric strong { margin-bottom: 16px; }
          .slate-assets { padding: 80px 18px 100px; }
          .slate-asset-row { align-items: flex-start; flex-direction: column; gap: 8px; }
          .slate-asset-type { align-self: flex-start; margin-left: 0; }

          /* Onesheet lightbox */
          .onesheet-lightbox img { height: auto; max-height: 78dvh; max-width: 94vw; }
          .onesheet-lightbox-actions { top: max(12px, env(safe-area-inset-top)); right: 12px; }
          .onesheet-lightbox-download { padding: 6px 12px; font-size: 10px; }
        }
        @keyframes rsvp-float {
          0%, 100% { transform: translateY(0); box-shadow: 0 8px 32px rgba(0,0,0,.4), 0 0 0 0 rgba(227,246,67,0); }
          50% { transform: translateY(-5px); box-shadow: 0 14px 40px rgba(0,0,0,.45), 0 0 28px 4px rgba(227,246,67,.18); }
        }
        .slate-float-rsvp {
          position: fixed;
          bottom: 44px;
          right: 48px;
          z-index: 50;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 37px;
          background: #e3f643;
          color: #0b0909;
          border: 0;
          border-radius: 999px;
          font: 700 14px/1 "Zalando Sans Expanded", sans-serif;
          letter-spacing: -.025em;
          cursor: pointer;
          animation: rsvp-float 3s ease-in-out infinite;
          transition: opacity .15s;
          white-space: nowrap;
        }
        .slate-float-rsvp:hover { animation: none; transform: translateY(-3px); box-shadow: 0 14px 44px rgba(0,0,0,.5), 0 0 32px 6px rgba(227,246,67,.22); }

      `}</style>
      <button type="button" className="slate-float-rsvp" onClick={() => { window.dispatchEvent(new Event("open-rsvp")); trackEvent("rsvp_open").catch(() => {}); }}>
        RSVP
      </button>

      {lightboxUrl && (
        <div className="onesheet-lightbox" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl.img} alt="One-Sheet" onClick={(e) => e.stopPropagation()} />
          <div className="onesheet-lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <a className="onesheet-lightbox-download" href={lightboxUrl.pdf} download onClick={() => expandedShow && trackEvent("onesheet_download", { show_id: expandedShow.id, show_title: expandedShow.title }).catch(() => {})}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-6-6h4V4h4v6h4l-6 6zm-8 4h16v-2H4v2z"/></svg>
              Download
            </a>
            <button type="button" className="onesheet-lightbox-close" onClick={() => setLightboxUrl(null)} aria-label="Close">✕</button>
          </div>
        </div>
      )}

    </main>
  );
}
