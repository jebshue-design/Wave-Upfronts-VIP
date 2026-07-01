import { supabase } from "@/lib/supabase";
import AdminTabs from "./AdminTabs";

export const revalidate = 0;

export default async function AdminPage() {
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: vipAccounts } = await supabase
    .from("vip_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  const passwordToName: Record<string, string> = {};
  for (const acc of (vipAccounts ?? [])) {
    passwordToName[acc.password] = `${acc.name} · ${acc.company}`;
  }

  const logins      = events?.filter((e) => e.type === "login") ?? [];
  const views       = events?.filter((e) => e.type === "show_view") ?? [];
  const engagements = events?.filter((e) =>
    ["show_youtube", "show_spotify", "show_sizzle", "show_onesheet"].includes(e.type)
  ) ?? [];

  // Per-user show map
  const userShowMap: Record<string, Record<string, number>> = {};
  for (const v of views) {
    const user = v.password_used ?? "unknown";
    const show = v.metadata?.show_title ?? v.metadata?.show_id ?? "Unknown Show";
    if (!userShowMap[user]) userShowMap[user] = {};
    userShowMap[user][show] = (userShowMap[user][show] ?? 0) + 1;
  }

  // Show popularity
  const showPopularity: Record<string, number> = {};
  for (const v of views) {
    const show = v.metadata?.show_title ?? v.metadata?.show_id ?? "Unknown Show";
    showPopularity[show] = (showPopularity[show] ?? 0) + 1;
  }
  const sortedShows = Object.entries(showPopularity).sort((a, b) => b[1] - a[1]);
  const maxViews = sortedShows[0]?.[1] ?? 1;

  // Per-show viewer list
  const showViewerMap: Record<string, Record<string, { count: number; lastSeen: string }>> = {};
  for (const v of views) {
    const show = v.metadata?.show_title ?? v.metadata?.show_id ?? "Unknown Show";
    const user = v.password_used ?? "unknown";
    if (!showViewerMap[show]) showViewerMap[show] = {};
    if (!showViewerMap[show][user]) showViewerMap[show][user] = { count: 0, lastSeen: v.created_at };
    showViewerMap[show][user].count += 1;
    if (new Date(v.created_at) > new Date(showViewerMap[show][user].lastSeen)) {
      showViewerMap[show][user].lastSeen = v.created_at;
    }
  }
  const showViewerData = sortedShows.map(([title]) => ({
    title,
    viewers: Object.entries(showViewerMap[title] ?? {})
      .sort((a, b) => b[1].count - a[1].count)
      .map(([user, { count, lastSeen }]) => ({
        user,
        views: count,
        lastSeen: new Date(lastSeen).toLocaleString(),
      })),
  }));

  // Per-user breakdown
  const allUsers = Array.from(new Set(events?.map((e) => e.password_used).filter(Boolean) ?? []));
  const userBreakdownData = allUsers
    .filter((user) => views.some((v) => v.password_used === user))
    .map((user) => {
      const userEvents = events?.filter((e) => e.password_used === user) ?? [];
      const userViews  = userEvents.filter((e) => e.type === "show_view");
      const allShowTitles = Array.from(new Set(userViews.map((v) => v.metadata?.show_title ?? v.metadata?.show_id ?? "Unknown")));
      const shows = allShowTitles
        .map((title) => {
          const showEvents = userEvents.filter((e) => e.metadata?.show_title === title || e.metadata?.show_id === title);
          const showViews  = showEvents.filter((e) => e.type === "show_view");
          const lastSeen   = showViews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at;
          return {
            title,
            views:          showViews.length,
            youtubeClicks:  showEvents.filter((e) => e.type === "show_youtube").length,
            spotifyClicks:  showEvents.filter((e) => e.type === "show_spotify").length,
            sizzleClicks:   showEvents.filter((e) => e.type === "show_sizzle").length,
            onesheetClicks: showEvents.filter((e) => e.type === "show_onesheet").length,
            lastSeen:       lastSeen ? new Date(lastSeen).toLocaleString() : "—",
          };
        })
        .sort((a, b) => b.views - a.views);
      const timestamps = userEvents.map((e) => new Date(e.created_at).getTime());
      return {
        user,
        totalViews: userViews.length,
        firstSeen:  new Date(Math.min(...timestamps)).toLocaleString(),
        lastSeen:   new Date(Math.max(...timestamps)).toLocaleString(),
        shows,
      };
    })
    .sort((a, b) => b.totalViews - a.totalViews);

  // Duration events by user → show
  const durationByUserShow: Record<string, Record<string, number>> = {};
  for (const e of events ?? []) {
    if (e.type === "show_duration" && e.password_used && e.metadata?.show_title) {
      const user = e.password_used;
      const show = e.metadata.show_title;
      const secs = parseInt(e.metadata.duration_seconds ?? "0", 10);
      if (!durationByUserShow[user]) durationByUserShow[user] = {};
      durationByUserShow[user][show] = (durationByUserShow[user][show] ?? 0) + secs;
    }
  }

  // Per-user engagement summary (keyed by password)
  const engagementByUser: Record<string, {
    topViewedShow:  { title: string; views: number }  | null;
    topClickedShow: { title: string; clicks: number } | null;
    topTimeShow:    { title: string; seconds: number } | null;
    totalShowsViewed: number;
    totalClicks: number;
    totalTimeSeconds: number;
  }> = {};

  for (const u of userBreakdownData) {
    const totalClicks = u.shows.reduce((s, sh) => s + sh.youtubeClicks + sh.spotifyClicks + sh.sizzleClicks + sh.onesheetClicks, 0);
    const topViewed   = u.shows.reduce<typeof u.shows[0] | null>((best, s) => !best || s.views > best.views ? s : best, null);
    const topClicked  = u.shows.reduce<{ title: string; clicks: number } | null>((best, s) => {
      const clicks = s.youtubeClicks + s.spotifyClicks + s.sizzleClicks + s.onesheetClicks;
      return !best || clicks > best.clicks ? { title: s.title, clicks } : best;
    }, null);
    const userDurations   = durationByUserShow[u.user] ?? {};
    const topTimeEntry    = Object.entries(userDurations).sort((a, b) => b[1] - a[1])[0];
    const totalTimeSeconds = Object.values(userDurations).reduce((s, n) => s + n, 0);

    engagementByUser[u.user] = {
      topViewedShow:  topViewed  ? { title: topViewed.title, views: topViewed.views } : null,
      topClickedShow: topClicked && topClicked.clicks > 0 ? topClicked : null,
      topTimeShow:    topTimeEntry ? { title: topTimeEntry[0], seconds: topTimeEntry[1] } : null,
      totalShowsViewed: u.shows.length,
      totalClicks,
      totalTimeSeconds,
    };
  }

  const S = {
    night:       "#0B0909",
    volt:        "#E3F643",
    silver:      "#FAF7F4",
    clay:        "#94958B",
    line:        "#2E332E",
    fontMono:    '"Space Grotesk", monospace',
    fontDisplay: '"Zalando Sans Expanded", system-ui, sans-serif',
  };

  const stats = [
    { label: "Total Logins",  value: logins.length },
    { label: "Unique Users",  value: new Set(logins.map((e) => e.password_used)).size },
    { label: "Show Views",    value: views.length },
    { label: "Link Clicks",   value: engagements.length },
    { label: "RSVPs",         value: rsvps?.length ?? 0 },
  ];

  return (
    <div style={{ background: S.night, minHeight: "100vh", color: S.silver, padding: "48px 40px", fontFamily: S.fontMono }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: S.volt, marginBottom: "10px" }}>
            Wave Upfronts 2026
          </div>
          <h1 style={{ fontFamily: S.fontDisplay, fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            Intelligence Dashboard
          </h1>
          <p style={{ fontSize: "12px", color: S.clay, margin: 0 }}>Live — refreshes on each page load</p>
        </div>

        <AdminTabs
          stats={stats}
          sortedShows={sortedShows}
          maxViews={maxViews}
          showViewerData={showViewerData}
          userBreakdownData={userBreakdownData}
          userShowMap={userShowMap}
          logins={logins}
          rsvps={rsvps}
          events={events ?? []}
          vipAccounts={vipAccounts ?? []}
          passwordToName={passwordToName}
          engagementByUser={engagementByUser}
        />

      </div>
    </div>
  );
}
