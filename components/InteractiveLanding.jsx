"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Toast from "@/components/Toast";
import LinkAppModal from "@/components/LinkAppModal";
import { useChat } from "@/components/ChatProvider";

const STORAGE_KEY = "fansfest_linked_apps";

const TABS = ["Activities", "Rewards", "Announcements"];

const HOW_IT_WORKS_SLIDES = [
  { title: "How it works", desc: "Check this post to learn more about platform." },
  { title: "Earn XP", desc: "Complete activities, trivia, and events to earn experience points." },
  { title: "Climb the ranks", desc: "Rise through fan tiers to unlock exclusive rewards." },
  { title: "Get rewarded", desc: "Redeem XP for merch, tickets, and meet & greets." },
];

const TRIVIA_OPTIONS = ["1. D6", "2. C6", "3. A5", "4. Bb4"];
const CORRECT_ANSWER = "1. D6";

// Activity members – matches Figma data exactly (names, flags, points, descriptions, times)
// Flag codes are ISO 3166-1 alpha-2 (lowercase) for flagcdn.com
// `boosted` flags members who get the special star pill next to their name (per Figma)
// Avatar keys map to /public/images/users/{key}.png pulled from Figma
const ACTIVITY_MEMBERS = [
  { name: "Jacques", points: 200, flag: "es", desc: "sharing a playlist", time: "15 min", avatar: "jacques" },
  { name: "Max", points: 500, flag: "es", desc: "outfit", time: "30 min", avatar: "max", boosted: true },
  { name: "Laurent", points: 800, flag: "ua", desc: "performing a cover", time: "30 min", avatar: "laurent" },
  { name: "Antoine", points: 100, flag: "es", desc: "joining newsletter", time: "15 min", avatar: "antoine" },
  { name: "Thierry", points: 150, flag: "ye", desc: "buying tickets", time: "15 min", avatar: "thierry" },
  { name: "Pierre", points: 900, flag: "ua", desc: "creating fan club", time: "45 min", avatar: "pierre-fan" },
  { name: "Michel", points: 300, flag: "ua", desc: "top contributor in chat", time: "30 min", avatar: "michel" },
  { name: "Oliver", points: 200, flag: "ua", desc: "sending a message", time: "12 min", avatar: "pierre-fan" },
  { name: "Farhad", points: 200, flag: "es", desc: "playing the game", time: "12 min", avatar: "jacques" },
  { name: "Sofia", points: 650, flag: "es", desc: "voting in poll", time: "5 min", avatar: "sofia" },
  { name: "Devon", points: 450, flag: "fr", desc: "inviting a friend", time: "8 min", avatar: "devon", boosted: true },
  { name: "Talia", points: 350, flag: "br", desc: "completing a quest", time: "20 min", avatar: "talia" },
  { name: "Marcus", points: 1100, flag: "ua", desc: "streaming new EP", time: "1 hr", avatar: "marcus" },
  { name: "Aaliyah", points: 250, flag: "ye", desc: "joining live Q&A", time: "10 min", avatar: "aaliyah" },
  { name: "Diego", points: 700, flag: "br", desc: "posting fan art", time: "25 min", avatar: "diego" },
  { name: "Anya", points: 550, flag: "ua", desc: "sharing on TikTok", time: "18 min", avatar: "anya" },
  { name: "Lucas", points: 400, flag: "es", desc: "writing a review", time: "35 min", avatar: "lucas" },
  { name: "Karim", points: 850, flag: "ye", desc: "predicting setlist", time: "40 min", avatar: "karim" },
];

// Avatars we have locally (pulled from Figma). Anything not in this set falls back to pravatar.cc
const LOCAL_AVATARS = new Set([
  "jacques", "max", "laurent", "antoine", "thierry", "michel", "pierre-fan",
  "roman", "julia", "jenny", "you",
]);
const avatarUrl = (key, size = 140) =>
  LOCAL_AVATARS.has(key) ? `/images/users/${key}.png` : `https://i.pravatar.cc/${size}?u=${key}`;

// Leaderboard data – three views with different rankings/scores
const LEADERBOARDS = {
  Weekly: [
    { rank: 1, name: "Roman Wesley", points: "1900", flag: "fr", avatar: "roman" },
    { rank: 2, name: "Julia Hanner", points: "1700", flag: "br", avatar: "julia" },
    { rank: 3, name: "Jenny Wilson", points: "1500", flag: "ga", avatar: "jenny" },
  ],
  Monthly: [
    { rank: 1, name: "Sofia Martinez", points: "8420", flag: "es", avatar: "sofia" },
    { rank: 2, name: "Roman Wesley", points: "7980", flag: "fr", avatar: "roman" },
    { rank: 3, name: "Marcus Chen", points: "7650", flag: "ua", avatar: "marcus" },
    { rank: 4, name: "Julia Hanner", points: "6900", flag: "br", avatar: "julia" },
    { rank: 5, name: "Aaliyah Khan", points: "6240", flag: "ye", avatar: "aaliyah" },
  ],
  "Full Leaderboard": [
    { rank: 1, name: "Sofia Martinez", points: "42,810", flag: "es", avatar: "sofia" },
    { rank: 2, name: "Roman Wesley", points: "39,205", flag: "fr", avatar: "roman" },
    { rank: 3, name: "Marcus Chen", points: "37,640", flag: "ua", avatar: "marcus" },
    { rank: 4, name: "Julia Hanner", points: "32,180", flag: "br", avatar: "julia" },
    { rank: 5, name: "Aaliyah Khan", points: "29,475", flag: "ye", avatar: "aaliyah" },
    { rank: 6, name: "Diego Costa", points: "26,890", flag: "br", avatar: "diego" },
    { rank: 7, name: "Anya Volkov", points: "24,310", flag: "ua", avatar: "anya" },
    { rank: 8, name: "Lucas Moreno", points: "21,750", flag: "es", avatar: "lucas" },
    { rank: 9, name: "Jenny Wilson", points: "19,420", flag: "ga", avatar: "jenny" },
    { rank: 10, name: "Karim Hassan", points: "17,890", flag: "ye", avatar: "karim" },
  ],
};

// "You" rank changes with the tab too
const YOU_RANK = { Weekly: 12, Monthly: 47, "Full Leaderboard": 132 };

const flagUrl = (code) => `https://flagcdn.com/w80/${code}.png`;

// Default activity cards — held in component state so admin can edit inline
const DEFAULT_ACTIVITY_CARDS = [
  { kind: "trivia", status: "Open", title: "What's the highest note EJAE can sing?", reward: "100XP" },
  { kind: "event", status: "Open", title: "EJAE listening party + fan Q&A", reward: "500XP", image: "/images/artist/ejae-portrait.jpeg", cta: "Check In Now" },
  { kind: "event", status: "Completed", title: "EJAE Trivia: Play to Earn Points and unlock achievements", reward: "500XP", image: "/images/artist/ejae-time-after-time.jpg", cta: "Play Now" },
  { kind: "event", status: "Open", title: "Record a cover", reward: "750XP", image: "/images/artist/instagram-live.webp", cta: "Submit Cover" },
];

// Default rewards — held in component state so admin can edit inline
const DEFAULT_REWARDS = [
  { title: "Limited Edition Merch", subtitle: "Spring Collection", req: "1000XP", image: "/images/artist/ejae-press.webp" },
  { title: "Discounted Tickets", subtitle: "Next tour presale access", req: "2000XP", image: "/images/artist/ejae-portrait.jpeg" },
  { title: "Signed Set List", subtitle: "Personally autographed by EJAE", req: "4000XP", image: "/images/artist/ejae-press.webp" },
  { title: "Backstage Meet & Greet", subtitle: "VIP access on tour stops", req: "6000XP", image: "/images/artist/ejae-press.webp" },
];

// Star icon used in section headings
const SectionStar = () => (
  <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-card text-mauve text-2xl shrink-0">
    ★
  </span>
);

// Gold coin token used in stats pills (matches Figma "Coin" instance)
const GoldCoin = ({ size = 16 }) => (
  <span
    className="inline-block rounded-full ring-[0.5px] ring-black/40 shrink-0"
    style={{
      width: size,
      height: size,
      background: "linear-gradient(135deg, #ffca17 0%, #977400 100%)",
    }}
    aria-hidden="true"
  />
);

// Boxed star badge (Figma dev mode: 2px radius, light-gray-to-light-blue gradient bg,
// subtle shadow, contains the mauve star vector). Used for VIP pill, "You" leaderboard, etc.
const BoxedStar = ({ size = 16 }) => (
  <span
    className="inline-flex items-center justify-center shrink-0"
    style={{
      width: size,
      height: size,
      padding: 2,
      borderRadius: 2,
      background: "linear-gradient(180deg, #F3F3F3 0%, rgba(173, 211, 241, 0.95) 100%)",
      boxShadow: "0 0.323px 0.323px 0 rgba(0,0,0,0.25)",
    }}
    aria-hidden="true"
  >
    <img src="/images/icons/star.svg" alt="" className="h-full w-full" />
  </span>
);

export default function InteractiveLanding() {
  const { openChat } = useChat();

  const [activeTab, setActiveTab] = useState(0);
  const [howItWorksSlide, setHowItWorksSlide] = useState(0);
  const [triviaAnswer, setTriviaAnswer] = useState(null);
  const [xp, setXp] = useState(1500);
  const [animatingXp, setAnimatingXp] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState("Weekly");

  // Editable cards (admin can edit inline by clicking the three-dot menu)
  const [activityCards, setActivityCards] = useState(DEFAULT_ACTIVITY_CARDS);
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);

  // Benefits modal (FREE vs SUPERFAN+)
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  // Membership / Add to Wallet modal
  const [walletOpen, setWalletOpen] = useState(false);
  // Which card is currently being edited: { section: 'activity'|'reward', index }
  const [editingCard, setEditingCard] = useState(null);
  const isEditing = (section, index) =>
    editingCard?.section === section && editingCard?.index === index;
  const toggleEdit = (section, index) => {
    setEditingCard((cur) => (cur?.section === section && cur?.index === index ? null : { section, index }));
  };
  const updateActivity = (i, patch) => {
    setActivityCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };
  const updateReward = (i, patch) => {
    setRewards((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  };

  const [linkModalApp, setLinkModalApp] = useState(null);
  const [linkedApps, setLinkedApps] = useState({});

  const rewardsSectionRef = useRef(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setLinkedApps(JSON.parse(raw));
    } catch {}
  }, []);

  const saveLinkedApps = useCallback((next) => {
    setLinkedApps(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const fireToast = useCallback((msg) => {
    setShowToast(false);
    setTimeout(() => {
      setToastMsg(msg);
      setShowToast(true);
    }, 50);
  }, []);

  const closeToast = useCallback(() => setShowToast(false), []);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (index === 1 && rewardsSectionRef.current) {
      rewardsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDotClick = () => {
    setHowItWorksSlide((prev) => (prev + 1) % HOW_IT_WORKS_SLIDES.length);
  };

  const handleTriviaAnswer = (option) => {
    if (triviaAnswer) return;
    setTriviaAnswer(option);
    if (option === CORRECT_ANSWER) {
      setAnimatingXp(true);
      setXp((prev) => prev + 100);
      fireToast("+100XP! Correct answer!");
      setTimeout(() => setAnimatingXp(false), 600);
    } else {
      fireToast("Wrong answer! The correct answer is D6.");
    }
  };

  const handleClaim = (requiredXp) => {
    const numReq = parseInt(requiredXp.replace(/[^0-9]/g, ""), 10);
    if (xp >= numReq) {
      fireToast("Reward claimed! Check your email for details.");
    } else {
      const needed = numReq - xp;
      fireToast(`You need ${needed.toLocaleString()} more XP to claim!`);
    }
  };

  const handleOpenLinkModal = (app) => setLinkModalApp(app);
  const handleCloseLinkModal = () => setLinkModalApp(null);
  const handleLinkApp = (key, handle) => {
    const next = { ...linkedApps, [key]: handle };
    saveLinkedApps(next);
    setLinkModalApp(null);
    fireToast(`${key.charAt(0).toUpperCase() + key.slice(1)} linked as @${handle}`);
  };
  const handleUnlinkApp = (key) => {
    const next = { ...linkedApps };
    delete next[key];
    saveLinkedApps(next);
    fireToast(`Unlinked ${key}`);
  };

  const handleInvite = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://fanfest.com/invite/ejae?ref=you").catch(() => {});
    }
    fireToast("Invite link copied!");
  };

  const formattedXp = xp.toLocaleString();
  const currentSlide = HOW_IT_WORKS_SLIDES[howItWorksSlide];

  return (
    <>
      {/* ─── Sub-nav: Mauve ovals matching Figma exactly ───
           Mobile: only the Chat Rooms pill (full width) is shown. Tabs + Admin Portal appear from md+. */}
      <div className="bg-bg pt-5 pb-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Activities / Rewards / Announcements – HIDDEN on mobile */}
            <div className="hidden md:inline-flex items-center bg-mauve rounded-full p-1 shrink-0">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(i)}
                  className={`font-display font-semibold uppercase text-[13px] sm:text-sm tracking-wide text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-200 ${
                    i === activeTab
                      ? "bg-mauve-700 shadow-md -translate-y-0.5"
                      : "hover:-translate-y-0.5 hover:bg-mauve-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right group: Chat Rooms (visible on all sizes) + Admin Portal (md+ only) */}
            <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
              <button
                onClick={openChat}
                className="inline-flex flex-1 md:flex-none items-center justify-between md:justify-start gap-2.5 bg-mauve text-white rounded-full pl-3 pr-2 py-2 hover:bg-mauve-600 transition"
              >
                <span className="inline-flex items-center gap-2.5">
                  <img src="/images/icons/chat-bubble.png" alt="" className="h-7 w-7 shrink-0" />
                  <span className="font-display font-semibold uppercase text-[13px] sm:text-sm tracking-wide">Chat Rooms</span>
                  <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-1.5 rounded-md bg-white text-mauve font-display font-bold text-base">
                    4
                  </span>
                </span>
                {/* Mobile-only: avatar stack on the right side of Chat Rooms pill */}
                <span className="md:hidden flex -space-x-2">
                  {["jacques", "lauren", "kristine"].map((u) => (
                    <span key={u} className="h-7 w-7 rounded-full overflow-hidden ring-2 ring-mauve">
                      <img src={`https://i.pravatar.cc/56?u=${u}`} alt="" className="h-full w-full object-cover" />
                    </span>
                  ))}
                </span>
              </button>
              {/* Admin Portal – HIDDEN on mobile */}
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center bg-peach text-white rounded-full px-5 py-2.5 hover:bg-peach-light hover:text-mauve transition font-display font-bold uppercase text-[13px] sm:text-sm tracking-wide"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── How It Works (Gray box) ─── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
        <div
          className="rounded-[32px] bg-figmaGray px-6 sm:px-8 py-5 flex items-center justify-between gap-4 cursor-pointer select-none"
          onClick={handleDotClick}
        >
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-bold text-black">{currentSlide.title}</h2>
            <p className="font-display text-sm sm:text-base font-medium text-black/70 mt-0.5">{currentSlide.desc}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {HOW_IT_WORKS_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === howItWorksSlide ? "w-10 bg-mauve" : "w-2 bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Activities Tab Content ─── */}
      {activeTab === 0 && (
        <>
          {/* ─── Hero Card (matches Figma node 107:2140 exactly) ───
               ONE merged card containing:
                 1. Top section (banner image bg) with profile pill, stats columns
                 2. White divider line
                 3. Bottom section (gray) with activity members
          */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-5">
            <div className="relative rounded-[32px] overflow-hidden bg-figmaGray">
              {/* Top section with banner image background — uses the Figma exported eyes banner.
                   Mobile (per Figma): NO banner image; the section uses plain figmaGray bg with dark text. */}
              <div className="relative bg-figmaGray md:bg-transparent">
                {/* Banner image — hidden on mobile per Figma mobile mockup */}
                <Image
                  src="/images/artist/ejae-eyes-banner.png"
                  alt="EJAE"
                  width={1408}
                  height={274}
                  className="hidden md:block w-full h-[274px] object-cover"
                  style={{ objectPosition: "center center" }}
                  priority
                />
                {/* Subtle dark overlay for legibility — only when image is shown */}
                <div className="hidden md:block absolute inset-0 bg-black/20" />

                {/* Overlay content: profile pill row + stats grid.
                     Desktop: absolute over the image. Mobile: relative inside the gray section. */}
                <div className="md:absolute md:inset-0 p-6 sm:p-8 flex flex-col gap-6 md:gap-8">
                  {/* Top row.
                       Mobile (Figma 107:7363): avatar + PIERRE name on left, XP coin + 75% pill on right.
                       Desktop: avatar pill on left, Join Fan Club CTA on right. */}
                  <div className="flex items-center justify-between gap-3">
                    <Link href="/profile" className="inline-flex items-center gap-3 group">
                      <div className="h-[50px] w-[50px] rounded-full bg-mauve grid place-items-center shrink-0">
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-figmaGray">
                          <img src="/images/users/pierre.png" alt="Pierre" className="h-full w-full object-cover" />
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="font-display font-medium text-sm text-black md:text-white leading-tight uppercase tracking-wide md:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">Pierre</span>
                        {/* "View Profile" only on desktop per Figma mobile mockup */}
                        <span className="hidden md:inline font-display font-medium text-[13px] text-white leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">View Profile</span>
                      </div>
                    </Link>

                    {/* Mobile-only: XP coin pill + 75% percent pill on the right of PIERRE */}
                    <div className="flex md:hidden items-center gap-2">
                      <div className="inline-flex items-center gap-1 bg-white rounded-full pl-1 pr-2.5 py-1">
                        <GoldCoin size={16} />
                        <span className={`font-display font-semibold text-[13px] text-black transition-all ${animatingXp ? "scale-110" : ""}`}>{formattedXp}XP</span>
                      </div>
                      <span className="inline-flex items-center bg-white rounded-full px-3 py-1 font-display font-semibold text-[13px] text-black">75%</span>
                    </div>

                    {/* Desktop-only: Join Fan Club CTA on the right */}
                    <Link
                      href="/signup"
                      className="hidden md:inline-flex bg-white text-mauve hover:bg-mauve hover:text-white transition rounded-full px-6 py-3 font-display font-bold uppercase text-sm tracking-wide shadow-card"
                    >
                      Join FanFest
                    </Link>
                  </div>

                  {/* Stats sections — desktop is 3 columns, mobile is stacked vertical sections.
                       Each section: title + status pill (side-by-side on mobile, stacked on desktop), then action button. */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-4 mt-auto">
                    {/* SECTION 1: TOTAL XP EARNED — on mobile, only shows the Invite friends button (xp/quests are in the PIERRE row above) */}
                    <div className="flex flex-col gap-3">
                      <div className="hidden md:flex md:flex-col md:gap-3">
                        <div className="font-display font-semibold text-[15px] text-black md:text-white uppercase tracking-wide">Total XP earned</div>
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center gap-1 bg-white rounded-full pl-1 pr-2.5 py-1">
                            <GoldCoin size={16} />
                            <span className={`font-display font-semibold text-[13px] text-black transition-all ${animatingXp ? "scale-110" : ""}`}>{formattedXp}XP</span>
                          </div>
                          <div className="flex items-center bg-white rounded-full p-[2px] h-8 w-[244px] max-w-full">
                            <div className="flex items-center justify-start bg-mauve rounded-full pl-[2px] pr-3 py-[2px] h-full" style={{ width: "calc(100% * 0.85)" }}>
                              <span className="inline-flex items-center justify-center bg-mauve-200 rounded-full h-full px-3 font-display font-semibold text-[13px] text-black whitespace-nowrap">
                                4/5 Quests Completed
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleInvite}
                        className="bg-white hover:bg-white/90 transition rounded-full pl-5 pr-1 py-1 flex items-center justify-between h-[50px]"
                      >
                        <span className="font-display font-medium text-[15px] text-black">Invite friends</span>
                        <span className="inline-flex items-center gap-1.5 bg-figmaGray rounded-full pl-1 pr-2.5 py-1">
                          <GoldCoin size={16} />
                          <span className="font-display font-semibold text-[13px] text-black">200XP</span>
                        </span>
                      </button>
                    </div>

                    {/* SECTION 2: MEMBERSHIP / WALLET — title (left) + VIP pill (right) on same row, button below */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-3">
                        <div className="font-display font-semibold text-[15px] text-black md:text-white uppercase tracking-wide">Membership / Wallet</div>
                        <div className="inline-flex items-center gap-1.5 bg-white rounded-full pl-1.5 pr-2.5 py-1">
                          <BoxedStar size={16} />
                          <span className="font-display font-semibold text-[13px] text-black">VIP</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setWalletOpen(true)}
                        className="bg-white hover:bg-white/90 transition rounded-full px-5 h-[50px] flex items-center justify-center font-display font-medium text-[15px] text-black"
                      >
                        Membership/Add to Wallet
                      </button>
                    </div>

                    {/* SECTION 3: SUPERFAN+ — title (left) + ACTIVE pill (right) on same row, button below */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-3">
                        <div className="font-display font-semibold text-[15px] text-black md:text-white uppercase tracking-wide">Superfan+</div>
                        <div className="inline-flex items-center gap-1.5 bg-white rounded-full pl-1 pr-2.5 py-1">
                          <img src="/images/icons/active-coin.png" alt="" className="h-4 w-4" />
                          <span className="font-display font-semibold text-[13px] text-black">ACTIVE</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setBenefitsOpen(true)}
                        className="bg-white hover:bg-white/90 transition rounded-full px-5 h-[50px] flex items-center justify-center font-display font-medium text-[15px] text-black"
                      >
                        See Benefits
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* White divider line — full width edge-to-edge (Figma node 107:2198: line stroke white 4px, no horizontal padding) */}
              <div className="bg-figmaGray pt-6 pb-5">
                <div className="h-[4px] w-full bg-white" />
              </div>

              {/* Activity members row (gray section, integrated in same card) */}
              <div
                className="bg-figmaGray pb-8 px-8 relative"
                style={{
                  // Right-edge fade so off-screen items soften out of view
                  WebkitMaskImage:
                    "linear-gradient(to right, black 0%, black calc(100% - 80px), transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, black 0%, black calc(100% - 80px), transparent 100%)",
                }}
              >
                {/* pt-3 inside the scroll container gives the coin badges (top: -4px) clearance,
                    since `overflow-x: auto` forces the browser to clip overflow-y too. */}
                <div className="flex gap-5 overflow-x-auto no-scrollbar pt-3">
                  {ACTIVITY_MEMBERS.map((m, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 w-[135px]">
                      <div className="relative w-[135px] h-[70px] flex items-center justify-center">
                        <div className="h-[70px] w-[70px] rounded-full overflow-hidden ring-[3px] ring-white">
                          <img src={avatarUrl(m.avatar, 140)} alt={m.name} className="h-full w-full object-cover" />
                        </div>
                        {/* Gold XP badge */}
                        <div
                          className="absolute h-8 w-8 rounded-full grid place-items-center ring-[3px] ring-white"
                          style={{
                            background: "linear-gradient(135deg, #ffca17 0%, #977400 100%)",
                            top: "-4px",
                            left: "16px",
                          }}
                        >
                          <div className="absolute inset-[1.5px] rounded-full border border-black/30 pointer-events-none" />
                          <span className="font-display font-bold text-white text-[11px] leading-none relative">{m.points}</span>
                        </div>
                        {/* Flag */}
                        <div
                          className="absolute h-8 w-8 rounded-full overflow-hidden ring-[3px] ring-white bg-white"
                          style={{ bottom: "-4px", right: "16px" }}
                        >
                          <img
                            src={flagUrl(m.flag)}
                            alt={m.flag.toUpperCase()}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <div className="w-full flex flex-col items-center text-center">
                        {/* Boosted members get a mauve pill with a boxed-star badge next to their name (per Figma — e.g. Max) */}
                        {m.boosted ? (
                          <div className="inline-flex items-center gap-1.5 bg-mauve rounded-full pl-2 pr-1.5 py-0.5">
                            <span className="font-display font-medium text-sm text-white">{m.name}</span>
                            <BoxedStar size={14} />
                          </div>
                        ) : (
                          <div className="font-display font-medium text-sm text-black px-1 py-0.5">{m.name}</div>
                        )}
                        <div className="font-display font-semibold text-[13px] text-black leading-snug px-1">
                          Earn points for {m.desc}
                        </div>
                        <div className="font-display font-medium text-xs text-black/60 mt-1">{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ─── Fans Leaderboard ─── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-5">
            <div className="rounded-[32px] bg-white border-2 border-mauve overflow-hidden">
              {/* Header (gray translucent overlay) */}
              <div className="bg-black/[0.06] px-5 sm:px-7 py-5 sm:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                  <div className="flex items-center gap-3">
                    {/* Stacked E + fans-icon + 1.2K badge (Figma uses Fans.svg, not eye icon) */}
                    <div className="flex flex-col items-center justify-center bg-mauve rounded-full w-9 py-2.5 shrink-0">
                      <span className="text-white font-bold text-[13px] leading-none">E</span>
                      <img src="/images/icons/fans.svg" alt="" className="h-4 w-4 mt-1" />
                      <span className="text-white font-display font-medium text-[10px] leading-none mt-1">1.2K</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-black uppercase tracking-tight">FANS LEADERBOARD</h3>
                      <p className="font-display font-medium text-sm text-black/70">Winner Gets 2 Concert Tickets And Pre-Show Artist Meet And Greet</p>
                      <p className="font-display font-medium text-xs text-black/50 mt-0.5">4 Days Left</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center bg-white rounded-full p-1 shrink-0 self-start sm:self-auto">
                    {["Weekly", "Monthly", "Full Leaderboard"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setLeaderboardTab(t)}
                        className={`px-3.5 sm:px-4 py-1.5 rounded-full font-display font-semibold text-xs transition ${
                          leaderboardTab === t ? "bg-mauve text-white" : "text-black/70 hover:text-black"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rows: alternating white (rounded) / gray. Source data switches with the active tab. */}
              <div>
                {LEADERBOARDS[leaderboardTab].map((r, i) => {
                  const isFirst = r.rank === 1;
                  const isOdd = i % 2 === 0;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-4 px-5 sm:px-7 py-4 ${
                        isOdd ? "bg-white" : "bg-figmaGray"
                      }`}
                    >
                      {/* Rank circle */}
                      <div
                        className={`h-9 w-9 rounded-full grid place-items-center font-display font-bold text-base shrink-0 ${
                          isFirst
                            ? "text-white border-2 border-[#ab8f54]"
                            : "bg-white border-2 border-mauve text-mauve"
                        }`}
                        style={
                          isFirst
                            ? { background: "linear-gradient(135deg, #ffca17 0%, #977400 100%)" }
                            : undefined
                        }
                      >
                        {r.rank}
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-9 w-9 rounded-full overflow-hidden shrink-0">
                          <img src={avatarUrl(r.avatar, 72)} alt={r.name} className="h-full w-full object-cover" />
                        </div>
                        <span
                          className={`font-medium text-sm truncate ${isFirst ? "" : "text-black"}`}
                          style={
                            isFirst
                              ? {
                                  background: "linear-gradient(135deg, #ffca17 0%, #977400 100%)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                  fontWeight: 700,
                                }
                              : undefined
                          }
                        >
                          {r.name}
                        </span>
                        <div className="h-4 w-4 rounded-full overflow-hidden ring-1 ring-black/10 shrink-0">
                          <img src={flagUrl(r.flag)} alt={r.flag.toUpperCase()} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                      </div>
                      <span className="font-display font-bold text-base text-black shrink-0">{r.points}</span>
                    </div>
                  );
                })}

                {/* You row (always last, mauve background) — rank changes per active tab */}
                <div className="flex items-center gap-4 px-5 sm:px-7 py-4 bg-figmaGray">
                  <div className="h-9 w-9 rounded-full bg-mauve grid place-items-center text-white font-display font-bold text-base shrink-0">
                    {YOU_RANK[leaderboardTab]}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 ring-2 ring-mauve">
                      <img src={avatarUrl("you", 72)} alt="You" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-display font-bold text-sm text-mauve">You</span>
                    <div className="h-4 w-4 rounded-full overflow-hidden ring-1 ring-black/10 shrink-0">
                      <img src={flagUrl("fr")} alt="FR" className="h-full w-full object-cover" />
                    </div>
                    {/* Boxed star badge next to You (matches Figma — gradient box with star inside) */}
                    <BoxedStar size={16} />
                  </div>
                  <span className="font-display font-bold text-base text-black shrink-0">{formattedXp}</span>
                </div>
              </div>

              <div className="px-5 sm:px-7 py-4 border-t border-mauve/30">
                <button className="font-display font-semibold text-sm text-mauve hover:text-mauve-700 transition">
                  Full Leaderboard &rarr;
                </button>
              </div>
            </div>
          </section>

          {/* ─── Interact to Unlock Rewards ─── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <SectionStar />
                <h2 className="font-display font-semibold text-2xl sm:text-[27px] text-black">Interact to Unlock Rewards</h2>
              </div>
              <div className="flex gap-2">
                <button className="h-12 w-12 rounded-full bg-white shadow-card grid place-items-center text-mauve hover:bg-mauve hover:text-white transition text-lg">←</button>
                <button className="h-12 w-12 rounded-full bg-white shadow-card grid place-items-center text-mauve hover:bg-mauve hover:text-white transition text-lg">→</button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activityCards.map((card, i) => {
                const isCompleted = card.status === "Completed";
                const editing = isEditing("activity", i);
                return (
                  <div
                    key={i}
                    className={`rounded-[32px] bg-white shadow-card overflow-hidden flex flex-col transition ${editing ? "ring-2 ring-mauve" : ""}`}
                  >
                    {/* Status pill — both Open and Completed are MAUVE per Figma (no green) */}
                    <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-figmaGray font-display font-semibold text-[13px] text-black">
                        {isCompleted ? (
                          <span className="h-4 w-4 rounded-full bg-mauve grid place-items-center">
                            <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" />
                            </svg>
                          </span>
                        ) : (
                          <span className="h-3 w-3 rounded-full border-2 border-black" />
                        )}
                        {card.status}
                      </span>
                      <button
                        onClick={() => toggleEdit("activity", i)}
                        title={editing ? "Done editing" : "Edit quest"}
                        className={`h-8 w-8 rounded-full border border-figmaGray transition grid place-items-center ${
                          editing ? "bg-mauve text-white border-mauve" : "bg-white hover:bg-figmaGray text-black/50"
                        }`}
                      >
                        {editing ? (
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                        )}
                      </button>
                    </div>
                    <div className="px-4 pb-4 flex-1 flex flex-col">
                      {card.kind === "trivia" ? (
                        <>
                          {editing ? (
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => updateActivity(i, { title: e.target.value })}
                              className="font-display font-bold text-[17px] text-black mb-3 leading-snug w-full bg-figmaGray rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-mauve"
                            />
                          ) : (
                            <p className="font-display font-bold text-[17px] text-black mb-3 leading-snug">{card.title}</p>
                          )}
                          <div className="space-y-2">
                            {TRIVIA_OPTIONS.map((opt, j) => {
                              let cls = "bg-figmaGray text-black hover:bg-mauve/10";
                              if (triviaAnswer) {
                                if (opt === triviaAnswer && opt === CORRECT_ANSWER) cls = "bg-mauve/10 text-mauve ring-1 ring-mauve";
                                else if (opt === triviaAnswer) cls = "bg-red-50 text-red-600 ring-1 ring-red-400";
                                else if (opt === CORRECT_ANSWER) cls = "bg-mauve/10 text-mauve ring-1 ring-mauve";
                              }
                              return (
                                <div
                                  key={j}
                                  onClick={() => handleTriviaAnswer(opt)}
                                  className={`px-3 py-2.5 rounded-xl font-display font-medium text-sm cursor-pointer transition ${cls}`}
                                >
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Stacked photo-card effect — layered, slightly rotated images per Figma */}
                          <div className="relative h-44 sm:h-52 mb-4 grid place-items-center">
                            <div className="relative w-[40%] sm:w-[60%] aspect-[4/5] max-h-full">
                              {/* Back card – rotated left */}
                              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-card -rotate-[8deg] translate-x-[-8%] translate-y-[6%]">
                                <Image src={card.image} alt="" fill className="object-cover" />
                              </div>
                              {/* Mid card – rotated right */}
                              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-card rotate-[6deg] translate-x-[6%] translate-y-[-2%]">
                                <Image src={card.image} alt="" fill className="object-cover" />
                              </div>
                              {/* Front card */}
                              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-card-lg">
                                <Image src={card.image} alt="" fill className="object-cover" />
                              </div>
                            </div>
                          </div>
                          {/* Title takes remaining space so the button is pinned to the bottom of every card */}
                          {editing ? (
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => updateActivity(i, { title: e.target.value })}
                              className="font-display font-bold text-[17px] text-black mb-3 leading-snug text-center flex-1 w-full bg-figmaGray rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-mauve"
                            />
                          ) : (
                            <p className="font-display font-bold text-[17px] text-black mb-3 leading-snug text-center flex-1">{card.title}</p>
                          )}
                          {editing ? (
                            <input
                              type="text"
                              value={card.cta}
                              onChange={(e) => updateActivity(i, { cta: e.target.value })}
                              className="w-full py-3 rounded-full font-display font-bold text-sm transition bg-mauve text-white text-center mt-auto outline-none focus:ring-2 focus:ring-white/60"
                            />
                          ) : (
                            <button
                              onClick={() => fireToast(`${card.cta} - check back soon!`)}
                              className="w-full py-3 rounded-full font-display font-bold text-sm transition bg-mauve text-white hover:bg-mauve-600 mt-auto"
                            >
                              {card.cta}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {/* Footer: Rewards (coin + XP) — Requirements removed per request */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="font-display font-semibold text-[13px] text-black mb-1">Rewards</div>
                        <span className="inline-flex items-center gap-1.5 bg-white rounded-full pl-1 pr-2.5 py-1 border border-figmaGray">
                          <GoldCoin size={16} />
                          {editing ? (
                            <input
                              type="text"
                              value={card.reward}
                              onChange={(e) => updateActivity(i, { reward: e.target.value })}
                              className="font-display font-semibold text-[13px] text-black bg-transparent w-16 outline-none"
                            />
                          ) : (
                            <span className="font-display font-semibold text-[13px] text-black">{card.reward}</span>
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-semibold text-[13px] text-black/40">Requirements</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* ─── Announcements Tab Content ─── */}
      {activeTab === 2 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
          <div className="rounded-[32px] bg-white border border-mauve/20 p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-mauve/10 grid place-items-center mx-auto mb-4">
              <svg className="h-8 w-8 text-mauve" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold mb-2">No Announcements Yet</h3>
            <p className="font-display text-sm text-black/60 max-w-md mx-auto">
              Stay tuned! EJAE will post announcements about upcoming releases, events, and exclusive fan content here.
            </p>
          </div>
        </section>
      )}

      {/* ─── Rewards (mauve cards) ─── */}
      <section ref={rewardsSectionRef} className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <SectionStar />
            <h2 className="font-display font-semibold text-2xl sm:text-[27px] text-black">Rewards</h2>
          </div>
          <div className="flex gap-2">
            <button className="h-12 w-12 rounded-full bg-white shadow-card grid place-items-center text-mauve hover:bg-mauve hover:text-white transition text-lg">←</button>
            <button className="h-12 w-12 rounded-full bg-white shadow-card grid place-items-center text-mauve hover:bg-mauve hover:text-white transition text-lg">→</button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((card, i) => {
            const isFeatured = i === 0;
            const editing = isEditing("reward", i);
            return (
              <div
                key={i}
                className={`rounded-[32px] bg-mauve shadow-card overflow-hidden flex flex-col text-white transition ${editing ? "ring-2 ring-white" : ""}`}
              >
                {/* Header: Open pill (white) + three-dot button (white) */}
                <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white font-display font-semibold text-[13px] text-black">
                    <span className="h-3 w-3 rounded-full border-2 border-black" />
                    Open
                  </span>
                  <button
                    onClick={() => toggleEdit("reward", i)}
                    aria-label={editing ? "Done editing" : "Edit reward"}
                    title={editing ? "Done editing" : "Edit reward"}
                    className={`h-8 w-8 rounded-full transition grid place-items-center ${
                      editing ? "bg-white text-mauve" : "bg-white hover:bg-white/90 text-black/60"
                    }`}
                  >
                    {editing ? (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Image area: featured card = single big picture; others = stacked photo cards */}
                <div className="px-4 pb-4 flex-1">
                  {isFeatured ? (
                    <div className="relative h-36 sm:h-52 rounded-2xl overflow-hidden mb-3 border border-figmaGray/40">
                      <Image src={card.image} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="relative h-44 sm:h-52 mb-4 grid place-items-center">
                      <div className="relative w-[40%] sm:w-[60%] aspect-[4/5] max-h-full">
                        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-card border border-figmaGray/40 -rotate-[8deg] translate-x-[-8%] translate-y-[6%]">
                          <Image src={card.image} alt="" fill className="object-cover" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-card border border-figmaGray/40 rotate-[6deg] translate-x-[6%] translate-y-[-2%]">
                          <Image src={card.image} alt="" fill className="object-cover" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-card-lg border border-figmaGray/40">
                          <Image src={card.image} alt="" fill className="object-cover" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title + subtitle, centered, white — editable in admin mode */}
                  <div className="text-center mb-3">
                    {editing ? (
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateReward(i, { title: e.target.value })}
                        className="font-display font-bold text-[17px] text-white leading-snug w-full text-center bg-white/10 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/50"
                      />
                    ) : (
                      <h3 className="font-display font-bold text-[17px] text-white leading-snug">{card.title}</h3>
                    )}
                    {editing ? (
                      <input
                        type="text"
                        value={card.subtitle || ""}
                        placeholder="Subtitle"
                        onChange={(e) => updateReward(i, { subtitle: e.target.value })}
                        className="font-display font-medium text-sm text-white/90 mt-1 w-full text-center bg-white/10 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-white/50"
                      />
                    ) : (
                      card.subtitle && <p className="font-display font-medium text-sm text-white/70 mt-1">{card.subtitle}</p>
                    )}
                  </div>

                  {/* Claim Now button — inverted (white bg, mauve text) for contrast on dark card */}
                  <button
                    onClick={() => handleClaim(card.req)}
                    className="w-full py-3 rounded-full bg-white text-mauve font-display font-bold text-sm hover:bg-white/90 transition"
                  >
                    Claim Now
                  </button>
                </div>

                {/* Footer: Requirements with gold-coin XP pattern (white text on mauve) */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-display font-semibold text-[13px] text-white mb-1">Requirements</div>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full pl-1 pr-2.5 py-1">
                      <GoldCoin size={16} />
                      {editing ? (
                        <input
                          type="text"
                          value={card.req}
                          onChange={(e) => updateReward(i, { req: e.target.value })}
                          className="font-display font-semibold text-[13px] text-white bg-transparent w-20 outline-none"
                        />
                      ) : (
                        <span className="font-display font-semibold text-[13px] text-white">{card.req}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Link Apps ─── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-2">
          <SectionStar />
          <h2 className="font-display font-semibold text-2xl sm:text-[27px] text-black">Link Apps</h2>
        </div>
        <p className="font-display font-medium text-sm sm:text-base text-black/70 mb-5 ml-[60px]">
          link your apps and use these hashtags so we can reward your fandom <span className="text-mauve font-semibold">#EJAE</span> <span className="text-mauve font-semibold">#TimeAfterTime</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              key: "spotify",
              name: "Spotify",
              placeholder: "yourusername",
              icon: (
                <img
                  src="/images/icons/spotify.svg"
                  alt="Spotify"
                  className="h-20 w-20 sm:h-24 sm:w-24 transition-transform group-hover:scale-110"
                />
              ),
            },
            {
              key: "tiktok",
              name: "TikTok",
              placeholder: "yourhandle",
              icon: (
                <svg viewBox="0 0 24 24" className="h-20 w-20 sm:h-24 sm:w-24 transition-transform group-hover:scale-110" fill="#cfa29f">
                  <path d="M20 8.3a6.7 6.7 0 01-4-1.3v7.7a5.7 5.7 0 11-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 102 2.8V2h2.8A4.2 4.2 0 0020 6.1v2.2z"/>
                </svg>
              ),
            },
            {
              key: "instagram",
              name: "Instagram",
              placeholder: "yourhandle",
              icon: (
                <img
                  src="/images/icons/instagram.svg"
                  alt="Instagram"
                  className="h-20 w-20 sm:h-24 sm:w-24 transition-transform group-hover:scale-110"
                />
              ),
            },
          ].map((app) => {
            const linked = linkedApps[app.key];
            return (
              <button
                key={app.key}
                type="button"
                onClick={() => handleOpenLinkModal({ ...app })}
                className={`group bg-white rounded-[32px] flex flex-col items-center justify-center py-10 hover:shadow-card-lg shadow-card transition-all relative ${linked ? "ring-2 ring-success/50" : ""}`}
              >
                {linked && (
                  <span className="absolute top-3 right-3 h-6 w-6 rounded-full bg-success text-white text-xs grid place-items-center" title="Linked">
                    ✓
                  </span>
                )}
                {app.icon}
                <div className="font-display font-bold text-base text-black mt-3">{app.name}</div>
                {linked ? (
                  <>
                    <div className="font-display font-medium text-xs text-success mt-1">@{linked}</div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); handleUnlinkApp(app.key); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); handleUnlinkApp(app.key); } }}
                      className="font-display font-medium text-[11px] text-black/50 mt-1 hover:text-mauve transition"
                    >
                      Unlink
                    </span>
                  </>
                ) : (
                  <div className="font-display font-medium text-xs text-black/50 mt-1">Tap to link</div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <LinkAppModal
        open={!!linkModalApp}
        app={linkModalApp}
        onClose={handleCloseLinkModal}
        onLink={handleLinkApp}
      />

      {/* ─── Membership / Add to Wallet modal ─── */}
      {walletOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setWalletOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          <div
            className="relative bg-figmaGray rounded-[32px] shadow-card-lg max-w-md w-full p-7 sm:p-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-title"
          >
            <button
              onClick={() => setWalletOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white text-mauve hover:bg-mauve hover:text-white transition grid place-items-center shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <h2
              id="wallet-title"
              className="font-display font-bold text-2xl text-mauve uppercase tracking-tight text-center"
            >
              Membership / Add to Wallet
            </h2>

            {/* Current plan card */}
            <div className="mt-6 bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-mauve">Current Plan</h3>
                <span className="inline-flex items-center gap-1.5 bg-figmaGray rounded-full pl-1.5 pr-2.5 py-1">
                  <BoxedStar size={14} />
                  <span className="font-display font-semibold text-[13px] text-mauve">SUPERFAN+</span>
                </span>
              </div>
              <p className="font-display font-medium text-sm text-mauve/80 mt-2 leading-snug">Active member since March 2026.</p>
            </div>

            {/* Wallet balance card */}
            <div className="mt-3 bg-white rounded-2xl p-5">
              <h3 className="font-display font-bold text-lg text-mauve">Wallet Balance</h3>
              <div className="mt-2 flex items-center gap-2">
                <GoldCoin size={20} />
                <span className="font-display font-bold text-2xl text-mauve">{formattedXp}<span className="text-base font-semibold">XP</span></span>
              </div>
              <p className="font-display font-medium text-sm text-mauve/80 mt-2 leading-snug">Top up your wallet to unlock rewards faster.</p>
            </div>

            {/* CTAs */}
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                onClick={() => { setWalletOpen(false); fireToast("Top-up flow coming soon!"); }}
                className="w-full py-3 rounded-full bg-mauve text-white font-display font-bold text-sm hover:bg-mauve-600 transition"
              >
                Top up XP
              </button>
              <button
                onClick={() => { setWalletOpen(false); setBenefitsOpen(true); }}
                className="w-full py-3 rounded-full bg-white text-mauve font-display font-bold text-sm hover:bg-white/90 transition"
              >
                Change to Free
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── See Benefits modal (FREE vs SUPERFAN+) ─── */}
      {benefitsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setBenefitsOpen(false)}
        >
          {/* Backdrop with blur (matches chat drawer style) */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Centered modal — gray rounded box with mauve text */}
          <div
            className="relative bg-figmaGray rounded-[32px] shadow-card-lg max-w-md w-full p-7 sm:p-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="benefits-title"
          >
            {/* Close button */}
            <button
              onClick={() => setBenefitsOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white text-mauve hover:bg-mauve hover:text-white transition grid place-items-center shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <h2
              id="benefits-title"
              className="font-display font-bold text-2xl text-mauve uppercase tracking-tight text-center"
            >
              FREE vs. SUPERFAN+
            </h2>

            {/* FREE section — each sentence on its own line */}
            <div className="mt-6 bg-white rounded-2xl p-5">
              <h3 className="font-display font-bold text-lg text-mauve">FREE</h3>
              <p className="font-display font-medium text-sm text-mauve/80 mt-1.5 leading-snug">Enjoy access to quests and rewards.</p>
              <p className="font-display font-medium text-sm text-mauve/80 leading-snug">View only access for chat.</p>
            </div>

            {/* SUPERFAN+ section — each sentence on its own line */}
            <div className="mt-3 bg-white rounded-2xl p-5">
              <h3 className="font-display font-bold text-lg text-mauve">SUPERFAN+</h3>
              <p className="font-display font-medium text-sm text-mauve/80 mt-1.5 leading-snug">Earn points faster.</p>
              <p className="font-display font-medium text-sm text-mauve/80 leading-snug">Ability to access and create chat rooms.</p>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMsg} show={showToast} onClose={closeToast} />
    </>
  );
}
