import Image from "next/image";
import { cookies } from "next/headers";
import { logout } from "./actions";
import { supabase } from "@/lib/supabase";
import IntroOverlay from "./components/IntroOverlay";
import AnimateCards from "./components/AnimateCards";
import NavLinks from "./components/NavLinks";
import RsvpForm from "./components/RsvpForm";
import RsvpModal from "./components/RsvpModal";
import TextIntro from "./components/TextIntro";
import ShowCard from "./components/ShowCard";
import ShowModalManager from "./components/ShowModalManager";
import VipAccessForm from "./components/VipAccessForm";
import SlateCarousel from "./components/SlateCarousel";

/* =========================================================
   SHOW DATA — swap in real content here
   ========================================================= */
const shows = [
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
    slateImagePath: "/assets/Images/Slate/Slides BG_Not Gonna Lie.png",
    accoladeLogoPath: "/assets/accolades/3x/webby@3x.png",
    accolades: [
      "2026|PODCAST OF|THE YEAR",
      "2026|BEST NEW PODCAST,|ENTERTAINMENT",
      "2026|BEST PARTNERSHIP|OR COLLABORATION",
      "2026|BEST INDIVIDUAL|EPISODE",
    ],
    talent: "Kylie Kelce",
    detailTopics: ["Entertainment", "Motherhood", "Women in Sports"],
    detailDescription: "Armed with one mic and zero f*cks, Kylie is ready to open up — on her own terms. Join her as she sets the record straight on gossip and speaks her truths on topics like modern parenting, social media trends, women in sports and more.",
    detailDemographics: "18-30\nFEMALE-LEANING",
    detailCadence: "WEEKLY\nMON / THU",
    detailFormat: "00:30M-1:00H\nAUDIO & VIDEO",
    detailPartnerships: "KEY PARTNERSHIPS AND EPISODES",
    youtubeUrl: "https://www.youtube.com/@nglwithkylie",
    audioUrl: "https://open.spotify.com/show/0RgXbSGGmwpzAyeLHbDqUD",
    audience: {
      followers: "3.7M",
      monthlyViews: "91M",
      monthlyDownloads: "2.9M",
      genderSkew: "86/14 Female",
      persona: "Kelce Mom — Female, 25–44, married with kids, upper-middle income; leans Caucasian and is interested in entertainment",
      quickHits: ["Modern motherhood", "Philanthropy", "Real talk"],
      guestExamples: ["Michelle Obama", "Kelly Clarkson", "Ms. Rachel", "Chelsea Handler"],
      ages: [
        { label: "13–17", pct: 2.21 },
        { label: "18–24", pct: 6.20 },
        { label: "25–34", pct: 34.67 },
        { label: "35–44", pct: 24.55 },
        { label: "45–54", pct: 13.62 },
        { label: "55–64", pct: 9.98 },
        { label: "65+", pct: 8.63 },
      ],
      hhi100k: "65.7%",
      usShare: "78%",
      topGeos: ["California 9.0%", "Texas 6.8%", "Pennsylvania 5.3%", "Florida 4.9%", "New York 4.6%"],
      devices: [
        { label: "Mobile", pct: 49.4 },
        { label: "TV", pct: 27.1 },
        { label: "Computer", pct: 14.4 },
        { label: "Tablet", pct: 9.1 },
      ],
      avgWatchTime: "22 min avg YouTube watch time",
      viewerBehavior: { new: 24.8, casual: 35.2, regular: 40.0 },
      interests: ["Country 47%", "American football 44%", "News 40%", "Rock 40%", "Reality TV 27%"],
      audienceOverlap: ["New Heights", "Good Hang", "The YOYOYO Podcast"],
    },
  },
  {
    id: "bad-friends",
    title: "Bad Friends",
    category: "COMEDY",
    categoryColor: "#FFC421",
    tagline: "Placeholder — replace with tagline.",
    description: "Comedians Bobby Lee and Andrew Santino bring their goofy, blue, and spontaneous humor to the Bad Friends podcast every week, landing themselves consistently at the top of the charts. Intentionally apolitical, built on their friendship and chemistry, this show attracts viewers from all walks of life for accessible comedy featuring some of today's top comedic voices.",
    detailDescription: "Comedians Bobby Lee and Andrew Santino bring their goofy, blue, and spontaneous humor to the Bad Friends podcast every week, landing themselves consistently at the top of the charts. Intentionally apolitical, built on their friendship and chemistry, this show attracts viewers from all walks of life for accessible comedy featuring some of today's top comedic voices.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Mixed",
    thumbnailPath: "/thumbnails/big-bro.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_Bad Friends.jpg",
    talent: "Andrew Santino & Bobby Lee",
    youtubeUrl: null as string | null,
    audioUrl: null as string | null,
  },
  {
    id: "whiskey-ginger",
    title: "Whiskey Ginger",
    category: "LIFESTYLE",
    categoryColor: "#FFC421",
    tagline: "Drinks, stories, and the people who make them.",
    description: "Comedian Andrew Santino interviews friends in and out of the entertainment industry as they reflect on deviant stories of their past; while sipping whiskey.",
    specs: "WEEKLY · ~55 MIN · AUDIO + VIDEO",
    season: "SEASON 5 · 2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "21–45 · Mixed",
    thumbnailPath: "/thumbnails/whiskey-ginger.jpg",
    slateImagePath: "/assets/Slides BG_Santino.jpg",
    talent: "Andrew Santino",
    youtubeUrl: "https://www.youtube.com/@AndrewSantinoWhiskeyGinger",
    audioUrl: "https://open.spotify.com/show/2QoIpuCjh332VOeDYxLr3A",
    audience: {
      followers: "2M",
      monthlyViews: "8M",
      monthlyDownloads: "1M",
      genderSkew: "85/15 Male",
      persona: "Comedy Bro — Male, 25–44, middle-to-upper income, interested in comedy, sports and gaming",
      quickHits: ["Comedy", "Celebrity & entertainment", "Lifestyle"],
      guestExamples: ["John Cena", "Eric Andre", "Shane Gillis", "Benny Blanco"],
      ages: [
        { label: "13–17", pct: 0.13 },
        { label: "18–24", pct: 5.30 },
        { label: "25–34", pct: 44.46 },
        { label: "35–44", pct: 36.33 },
        { label: "45–54", pct: 10.44 },
        { label: "55–64", pct: 2.29 },
        { label: "65+", pct: 0.99 },
      ],
      hhi100k: "58.7%",
      usShare: "80%",
      topGeos: ["California 9.2%", "Texas 4.5%", "Wisconsin 3.7%", "Illinois 3.0%", "Florida 2.8%"],
      devices: [
        { label: "Mobile", pct: 54.4 },
        { label: "TV", pct: 25.6 },
        { label: "Computer", pct: 15.4 },
        { label: "Tablet", pct: 4.1 },
      ],
      avgWatchTime: "32.2 min avg watch · 27.2 min avg listen",
      viewerBehavior: { new: 31.1, casual: 40.2, regular: 28.7 },
      interests: ["Comedy 25%", "Sport 22%", "Gaming 21%", "Sports 19%", "Rap & hip hop 19%"],
      audienceOverlap: ["Bad Friends", "Theo Von", "PowerfulJRE"],
    },
  },
  {
    id: "almost-athletes",
    title: "Almost Athletes",
    category: "COMEDY",
    categoryColor: "#D12670",
    tagline: "They never made the cut. They never stopped trying.",
    description: "Almost Athletes with Dude Perfect is (almost) a sports podcast. Co-hosted by Garrett Hilbert and Sparky, with the rest of the Dudes, their wives, and the DP crew popping in throughout the week. Sports takes, celebrity guests, athlete interviews, fan voicemails, and the kind of chaos you'd expect from the Dude Perfect family.",
    specs: "WEEKLY · ~60 MIN · AUDIO + VIDEO",
    season: "SEASON 2 · 2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–34 · Male-Leaning",
    thumbnailPath: "/thumbnails/almost-athletes.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_Almost Athletes.jpg",
    detailNavTone: "dark",
    talent: "Dude Perfect",
    youtubeUrl: "https://www.youtube.com/@almostathletes",
    audioUrl: "https://open.spotify.com/show/55gaQm31JIbp6td7QtYsPU",
    audience: {
      followers: "162K",
      monthlyViews: "8M",
      monthlyDownloads: "503K",
      genderSkew: "81/19 Male",
      persona: "Family Sports Fan — Male, 18–34 with meaningful teen reach; highest household income in the slate; married with kids",
      quickHits: ["Sports & entertainment", "Lifestyle", "Family", "Friendship"],
      guestExamples: ["Steph Curry", "Peyton Manning", "Caitlin Clark", "Tom Brady"],
      ages: [
        { label: "13–17", pct: 9.52 },
        { label: "18–24", pct: 21.37 },
        { label: "25–34", pct: 29.00 },
        { label: "35–44", pct: 23.69 },
        { label: "45–54", pct: 12.97 },
        { label: "55–64", pct: 2.37 },
        { label: "65+", pct: 1.03 },
      ],
      hhi100k: "66.6%",
      usShare: "86%",
      topGeos: ["Texas 10.1%", "California 5.5%", "Florida 4.0%", "Ohio 3.8%", "Pennsylvania 3.5%"],
      devices: [
        { label: "Mobile", pct: 32.1 },
        { label: "TV", pct: 46.9 },
        { label: "Computer", pct: 12.8 },
        { label: "Tablet", pct: 8.3 },
      ],
      avgWatchTime: "30 min avg watch · 22 min avg listen",
      viewerBehavior: { new: 36.1, casual: 46.5, regular: 17.5 },
      interests: ["American football 52%", "Sport 49%", "Christian & gospel 35%", "Basketball 34%", "News 34%"],
      audienceOverlap: ["Dude Perfect Outdoors", "The FRDI Show", "DP Interns"],
    },
  },
  {
    id: "open-thoughts",
    title: "Open Thoughts",
    category: "INTERVIEW",
    categoryColor: "#0AC2FF",
    tagline: "Real conversations. No script.",
    description: "Nothing's scripted. Nothing's safe. On Open Thoughts, Funny Marco sits down with some of the biggest names in the game for the most unpredictable conversations on the internet.",
    specs: "BIWEEKLY · ~50 MIN · AUDIO + VIDEO",
    season: "SEASON 1 · 2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "25–44 · Mixed",
    thumbnailPath: "/thumbnails/open-thoughts.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_Open Thoughts.jpg",
    talent: "Funny Marco",
    youtubeUrl: "https://www.youtube.com/@OpenThoughts0",
    audioUrl: "https://open.spotify.com/show/7AwnOVezHIfHVbNVINNlQL",
    audience: null,
  },
  {
    id: "so-true",
    title: "So True",
    category: "COMEDY",
    categoryColor: "#0AC2FF",
    tagline: "Placeholder — replace with tagline.",
    description: "A weekly podcast from beloved gay comedian Caleb Hearon. Basically, just getting into it and sorting it all out and kind of identifying what’s really real.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–34 · Mixed",
    thumbnailPath: "/thumbnails/so-true.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_So True.jpg",
    accoladeGroups: [
      {
        logoPath: "/assets/accolades/3x/iHeart@3x.png",
        logoAlt: "iHeartRadio",
        accolades: ["2026|BEST PODCAST|HOST"],
      },
      {
        logoPath: "/assets/accolades/3x/Queerties@3x.png",
        logoAlt: "The Queerties",
        accolades: ["2026|PODCAST OF THE|YEAR NOMINEE"],
      },
      {
        logoPath: "/assets/accolades/3x/webby@3x.png",
        logoAlt: "The Webby Awards",
        accolades: ["2025|OFFICIAL WEBBY|HONOREE"],
      },
    ],
    talent: "Caleb Hearon",
    youtubeUrl: "https://www.youtube.com/@sooootruepod",
    audioUrl: "https://open.spotify.com/show/3EgXpWE5vz6JkRtjhenVOU",
    audience: {
      followers: "581K",
      monthlyViews: "31M",
      monthlyDownloads: "N/A",
      genderSkew: "70/28 Female",
      persona: "So Truer — Female-leaning, notably younger skew, urban, into music and comedy",
      quickHits: ["Comedy & entertainment", "Pop culture", "Lifestyle"],
      guestExamples: ["Bob the Drag Queen", "Trixie Mattel", "Brittany Broski", "Hannah Berner"],
      ages: [
        { label: "13–17", pct: 0.58 },
        { label: "18–24", pct: 13.72 },
        { label: "25–34", pct: 40.44 },
        { label: "35–44", pct: 12.71 },
        { label: "45–54", pct: 3.41 },
        { label: "55–64", pct: 1.23 },
        { label: "65+", pct: 0.51 },
      ],
      hhi100k: "58.4%",
      usShare: "62%",
      topGeos: ["California 13.5%", "Texas 7.4%", "New York 6.1%", "Florida 4.5%", "Illinois 3.8%"],
      devices: [
        { label: "Mobile", pct: 52.8 },
        { label: "TV", pct: 26.2 },
        { label: "Computer", pct: 15.2 },
        { label: "Tablet", pct: 5.8 },
      ],
      avgWatchTime: "25 min avg YouTube watch time",
      viewerBehavior: { new: 34.8, casual: 34.5, regular: 30.6 },
      interests: ["Alternative/Indie rock 45%", "LGBTQ+ 45%", "Pop 41%", "Rock 41%", "Comedy 32%"],
      audienceOverlap: ["Royal Court", "cassieopeeyah", "Ziwe"],
    },
  },
  {
    id: "wingmen",
    title: "Wingmen",
    category: "SPORTS",
    categoryColor: "#0BDD65",
    tagline: "Placeholder — replace with tagline.",
    description: "Welcome to Wingmen, hosted by NHL brothers Matthew & Brady Tkachuk. Your all-access pass into the world of hockey, brotherhood, and behind-the-scenes stories you won’t hear anywhere else.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Male-Leaning",
    thumbnailPath: "/thumbnails/wingmen.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_Wingmen.jpg",
    talent: "Matthew & Brady Tkachuk",
    youtubeUrl: "https://www.youtube.com/@Wingmenpod",
    audioUrl: "https://open.spotify.com/show/0phWiahC5nLC7azlkhe8hh",
    audience: {
      followers: "162K",
      monthlyViews: "12M",
      monthlyDownloads: "135K",
      genderSkew: "87/12 Male",
      persona: "Hockey Loyalist — Male, 25–44; highest income of the slate; notably cross-border with many Canadian viewers; married and hockey-first",
      quickHits: ["Hockey talk", "NHL insights", "Sports fandom", "Family"],
      guestExamples: ["NHL teammates", "NHL legends", "Celebrity fans", "Notable personalities"],
      ages: [
        { label: "13–17", pct: 1.09 },
        { label: "18–24", pct: 11.09 },
        { label: "25–34", pct: 42.48 },
        { label: "35–44", pct: 26.09 },
        { label: "45–54", pct: 11.35 },
        { label: "55–64", pct: 5.55 },
        { label: "65+", pct: 2.32 },
      ],
      hhi100k: "67.0%",
      usShare: "59%",
      topGeos: ["Ottawa, ON 3.2%", "Toronto, ON 2.5%", "Calgary, AB 1.4%", "New York 0.9%", "Montreal, QC 0.8%"],
      devices: [
        { label: "Mobile", pct: 45.4 },
        { label: "TV", pct: 32.6 },
        { label: "Computer", pct: 16.4 },
        { label: "Tablet", pct: 5.6 },
      ],
      avgWatchTime: "27.4 min avg watch · 21.3 min avg listen",
      viewerBehavior: { new: 32.2, casual: 55.8, regular: 12.0 },
      interests: ["Hockey 63%", "Sport 56%", "American football 38%", "Baseball 33%", "Golf 31%"],
      audienceOverlap: ["TFS", "Game Script NHL", "sdpn"],
    },
  },
  {
    id: "7pm-brooklyn",
    title: "7PM in Brooklyn",
    category: "SPORTS",
    categoryColor: "#FF5C35",
    tagline: "Placeholder — replace with tagline.",
    description: "Hoops, culture, and conversation collide at 7PM. Carmelo Anthony sits with a rotating all star crew of The Kid Mero, Rudy Gay, Monica McNutt, and Kazeem Famuyide to tap into the game, the culture, and the stories that shape both.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Male-Leaning",
    thumbnailPath: "/thumbnails/7pm-brooklyn.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_7PM in Brooklyn.jpg",
    accoladeLogoPath: "/assets/accolades/3x/webby@3x.png",
    accolades: [
      "2026|BEST SPORTS|SHOW FINALIST",
      "2026|BEST FEATURED|GUEST NOMINEE",
    ],
    talent: "Carmelo Anthony",
    youtubeUrl: "https://www.youtube.com/@7PMinBrooklyn",
    audioUrl: "https://open.spotify.com/show/4sEy5p87mJ002F3NGsKIpq",
    audience: {
      followers: "1.7M",
      monthlyViews: "52M",
      monthlyDownloads: "1.1M",
      genderSkew: "89/11 Male",
      persona: "Culture Fan — Male, 25–44, one of the slate's most ethnically diverse audiences, basketball- and hip-hop-obsessed",
      quickHits: ["Sports & entertainment", "Lifestyle", "Music", "Fashion"],
      guestExamples: ["Spike Lee", "Sue Bird", "Issa Rae", "Jayson Tatum"],
      ages: [
        { label: "13–17", pct: 0.19 },
        { label: "18–24", pct: 7.25 },
        { label: "25–34", pct: 37.20 },
        { label: "35–44", pct: 31.42 },
        { label: "45–54", pct: 15.18 },
        { label: "55–64", pct: 6.05 },
        { label: "65+", pct: 2.65 },
      ],
      hhi100k: "50.0%",
      usShare: "80%",
      topGeos: ["New York 10.6%", "California 8.1%", "Texas 7.4%", "Florida 5.8%", "Georgia 5.3%"],
      devices: [
        { label: "Mobile", pct: 41.6 },
        { label: "TV", pct: 48.5 },
        { label: "Computer", pct: 7.3 },
        { label: "Tablet", pct: 2.6 },
      ],
      avgWatchTime: "24 min avg YouTube watch time",
      viewerBehavior: { new: 26.9, casual: 40.5, regular: 32.7 },
      interests: ["Sport 57%", "Basketball 57%", "Rap & hip hop 52%", "Sports 44%", "American football 44%"],
      audienceOverlap: ["Club 520 Podcast", "The Arena", "Nightcap"],
    },
  },
  {
    id: "big-bro",
    title: "Big Bro",
    category: "COMEDY",
    categoryColor: "#D12670",
    tagline: "Placeholder — replace with tagline.",
    description: "Cudi invites his favorite people in culture and entertainment to come kick it. He puts you on to dope s**t, and taps into the real journey behind his and his guests' biggest successes.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–34 · Mixed",
    thumbnailPath: "/thumbnails/big-bro.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_Big Bro.jpg",
    talent: "Kid Cudi",
    youtubeUrl: "https://www.youtube.com/@BigBroCudi",
    audioUrl: null as string | null,
    audience: {
      followers: "62K",
      monthlyViews: "14M",
      monthlyDownloads: "N/A",
      genderSkew: "77% Male",
      persona: "Young Culture Creative — Male, 25–34, largely single, highly college-educated, lower household income, driven by music/entertainment/culture",
      quickHits: ["Celebrity & entertainment", "Music", "Art", "Lifestyle"],
      guestExamples: ["Kylie Jenner", "Jenna Ortega", "Timothée Chalamet", "Tyler James Williams"],
      ages: [
        { label: "13–17", pct: 4.25 },
        { label: "18–24", pct: 14.62 },
        { label: "25–34", pct: 54.66 },
        { label: "35–44", pct: 19.62 },
        { label: "45–54", pct: 4.56 },
        { label: "55–64", pct: 1.48 },
        { label: "65+", pct: 0.81 },
      ],
      hhi100k: "12%",
      usShare: "72%",
      topGeos: ["California 16%", "Texas 8.5%", "New York 5.6%", "Florida 5.2%", "Georgia 3.3%"],
      devices: [
        { label: "Mobile", pct: 45.8 },
        { label: "TV", pct: 35.4 },
        { label: "Computer", pct: 13.1 },
        { label: "Tablet", pct: 5.6 },
      ],
      avgWatchTime: "16.4 min avg YouTube watch time",
      viewerBehavior: { new: 72.6, casual: 27.4, regular: 0 },
      interests: ["Rap & hip hop 39.6%", "Sport 25.7%", "Music 24.4%", "American football 24.1%", "Basketball 23.7%"],
      audienceOverlap: ["JoeandJada", "soseriuzradio", "Druski"],
    },
  },
  {
    id: "house-of-maher",
    title: "House of Maher",
    category: "COMEDY",
    categoryColor: "#FFC421",
    tagline: "Placeholder — replace with tagline.",
    description: "Bad Friends.... a podcast with Bobby Lee and Andrew Santino.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Mixed",
    thumbnailPath: "/thumbnails/house-of-maher.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_House of Maher.jpg",
    detailNavTone: "dark",
    talent: "Ilona Maher",
    youtubeUrl: "https://www.youtube.com/@HouseofMaher",
    audioUrl: "https://open.spotify.com/show/5kQkbgxHPgvBc0wcb9qhNK",
    audience: {
      followers: "230K",
      monthlyViews: "30M",
      monthlyDownloads: "328K",
      genderSkew: "83/17 Female",
      persona: "Maher Millennial — Female, 25–34, college-leaning millennial with strong household income, drawn to music and pop culture",
      quickHits: ["Pop culture", "Women empowerment", "Lifestyle", "Sports"],
      guestExamples: ["Alan Bersten", "Malala Yousafzai", "Mamrie Hart", "Kylie Kelce"],
      ages: [
        { label: "13–17", pct: 0.70 },
        { label: "18–24", pct: 15.15 },
        { label: "25–34", pct: 46.42 },
        { label: "35–44", pct: 16.93 },
        { label: "45–54", pct: 9.94 },
        { label: "55–64", pct: 7.04 },
        { label: "65+", pct: 4.08 },
      ],
      hhi100k: "64.7%",
      usShare: "76%",
      topGeos: ["California 9.5%", "Texas 6.3%", "New York 4.0%", "Florida 4.0%", "Pennsylvania 3.0%"],
      devices: [
        { label: "Mobile", pct: 52.9 },
        { label: "TV", pct: 22.8 },
        { label: "Computer", pct: 15.9 },
        { label: "Tablet", pct: 8.5 },
      ],
      avgWatchTime: "22 min avg YouTube watch time",
      viewerBehavior: { new: 52.8, casual: 36.3, regular: 10.9 },
      interests: ["Rock 32%", "Country 31%", "News 31%", "Pop 30%", "Alternative/Indie rock 30%"],
      audienceOverlap: ["Not Gonna Lie", "Good Hang", "hudcon central"],
    },
  },
  {
    id: "power-hour",
    title: "Power Hour",
    category: "LIFESTYLE",
    categoryColor: "#69EDE9",
    tagline: "Placeholder — replace with tagline.",
    description: "This ain't your average fitness show. Here, we champion three things: Strength, pushing boundaries, and looking good while doing it. Ilona Maher brings some of the biggest names in sports and entertainment into the gym to test their limits.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Mixed",
    thumbnailPath: "/thumbnails/open-thoughts.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_Power Hour.jpg",
    talent: "Ilona Maher",
    youtubeUrl: null as string | null,
    audioUrl: null as string | null,
  },
  {
    id: "my-momma-told-me",
    title: "My Momma Told Me",
    category: "COMEDY",
    categoryColor: "#0AC2FF",
    tagline: "Placeholder — replace with tagline.",
    description: "Placeholder — replace with show description.",
    specs: "Placeholder — replace with specs.",
    season: "2026",
    videoPath: null as string | null,
    oneSheetPath: null as string | null,
    demo: "18–35 · Mixed",
    thumbnailPath: "/thumbnails/so-true.jpg",
    slateImagePath: "/assets/Images/Slate/Slides BG_My Momma Told Me.jpg",
    talent: "Langston Kerman & David Gborie",
    youtubeUrl: null as string | null,
    audioUrl: null as string | null,
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
export default async function LandingPage() {
  const cookieStore = await cookies();

  if (cookieStore.has("wave-auth")) {
    const email = cookieStore.get("wave-user")?.value ?? "";
    let user: { firstName: string; lastName: string; email: string; company: string; title: string } | undefined;
    if (email) {
      const { data } = await supabase
        .from("vip_accounts")
        .select("name, email, company, title")
        .eq("email", email)
        .maybeSingle();
      if (data) {
        const parts = (data.name ?? "").trim().split(/\s+/);
        user = {
          firstName: parts[0] ?? "",
          lastName: parts.slice(1).join(" "),
          email: data.email ?? email,
          company: data.company ?? "",
          title: data.title ?? "",
        };
      }
    }
    return <SlateCarousel shows={[...shows].sort((first, second) => Number(second.id === "ngl") - Number(first.id === "ngl"))} user={user} />;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#000000", color: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", gap: "0" }}>
      {/* Logo */}
      <img
        src="/assets/Wave Logo.svg"
        alt="Wave Sports & Entertainment"
        style={{ width: "121px", height: "auto", marginBottom: "52px" }}
      />

      {/* Eyebrow */}
      <p style={{ margin: "0 0 18px", fontFamily: '"Zalando Sans Expanded", sans-serif', fontSize: "10px", fontWeight: 700, letterSpacing: "-0.025em", textTransform: "uppercase", color: "rgba(244,245,240,0.45)", textAlign: "center" }}>
        VIP Access
      </p>

      {/* Title */}
      <h1 style={{ margin: "0 0 36px", fontFamily: '"Zalando Sans Expanded", sans-serif', fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 0.92, color: "#f4f5f0", textAlign: "center" }}>
        Wave Upfronts 2027
      </h1>

      {/* Email gate */}
      <VipAccessForm />

      {/* Footer */}
      <p style={{ position: "fixed", bottom: "20px", fontFamily: '"Zalando Sans", sans-serif', fontSize: "11px", color: "rgba(244,245,240,0.28)", letterSpacing: "-0.025em" }}>
        © 2026 Wave Sports &amp; Entertainment
      </p>
    </main>
  );
}

async function VipPage() {
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

          {/* Welcome name */}
          {vipName && (
            <div style={{
              fontFamily: S.fontMono,
              fontSize: "13px",
              fontWeight: 600,
              color: S.clay,
              marginBottom: "16px",
              letterSpacing: "0.04em",
            }}>
              Welcome, <span style={{ color: S.silver }}>{vipName.split(" ")[0]}</span>
            </div>
          )}

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
            Files marked &quot;Upload pending&quot; will be available before the event.
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
