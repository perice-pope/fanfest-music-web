"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Toast from "@/components/Toast";
import { useChat } from "@/components/ChatProvider";

const TABS = ["Activities", "Rewards", "Announcements"];

const HOW_IT_WORKS_SLIDES = [
  { title: "How it works", desc: "Check this post to learn more about platform." },
  { title: "Earn XP", desc: "Complete activities, trivia, and events to earn experience points." },
  { title: "Climb the ranks", desc: "Rise through fan tiers to unlock exclusive rewards." },
  { title: "Get rewarded", desc: "Redeem XP for merch, tickets, and meet & greets." },
];

const TRIVIA_OPTIONS = ["1. D6", "2. C6", "3. A5", "4. Bb4"];
const CORRECT_ANSWER = "1. D6";

export default function InteractiveLanding() {
  const { openChat } = useChat();

  // ── State ──
  const [activeTab, setActiveTab] = useState(0);
  const [howItWorksSlide, setHowItWorksSlide] = useState(0);
  const [triviaAnswer, setTriviaAnswer] = useState(null); // null | string
  const [xp, setXp] = useState(1500);
  const [animatingXp, setAnimatingXp] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [rewardCarouselStart, setRewardCarouselStart] = useState(0);

  const rewardsSectionRef = useRef(null);

  // ── Helpers ──
  const fireToast = useCallback((msg) => {
    setShowToast(false);
    // Small delay so React can unmount the previous toast before re-mounting
    setTimeout(() => {
      setToastMsg(msg);
      setShowToast(true);
    }, 50);
  }, []);

  const closeToast = useCallback(() => setShowToast(false), []);

  // ── Tab handler ──
  const handleTabClick = (index) => {
    setActiveTab(index);
    if (index === 1 && rewardsSectionRef.current) {
      rewardsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ── How It Works pagination ──
  const handleDotClick = () => {
    setHowItWorksSlide((prev) => (prev + 1) % HOW_IT_WORKS_SLIDES.length);
  };

  // ── Trivia answer ──
  const handleTriviaAnswer = (option) => {
    if (triviaAnswer) return; // already answered
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

  // ── Rewards claim ──
  const handleClaim = (requiredXp) => {
    const numReq = parseInt(requiredXp.replace(/[^0-9]/g, ""), 10);
    if (xp >= numReq) {
      fireToast("Reward claimed! Check your email for details.");
    } else {
      const needed = numReq - xp;
      fireToast(`You need ${needed.toLocaleString()} more XP to claim!`);
    }
  };

  // ── Invite Friends ──
  const handleInvite = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://fansfest.com/invite/ejae?ref=you").catch(() => {});
    }
    fireToast("Invite link copied!");
  };

  // ── Format XP ──
  const formattedXp = xp.toLocaleString();

  // ── Current "How it works" slide ──
  const currentSlide = HOW_IT_WORKS_SLIDES[howItWorksSlide];

  return (
    <>
      {/* ─── Sub-nav Tabs ─── */}
      <div className="bg-white border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink min-w-0">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(i)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition ${
                    i === activeTab
                      ? "bg-brand-50 text-brand"
                      : "text-muted hover:text-text hover:bg-surface2"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button onClick={openChat} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-muted hover:text-brand rounded-lg hover:bg-surface2 transition">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
                <span className="hidden sm:inline">Chat Rooms</span>
                <span className="badge text-[10px]">4</span>
              </button>
              <div className="hidden sm:flex -space-x-2">
                {["bg-brand","bg-lavender-400","bg-pink"].map((c,i) => <div key={i} className={`h-8 w-8 rounded-full ${c} ring-2 ring-white`} />)}
              </div>
              <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-surface2 text-muted rounded-lg hover:text-brand transition">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── How It Works Banner ─── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <div
          className="rounded-2xl bg-white border border-border/60 shadow-card px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 cursor-pointer select-none"
          onClick={handleDotClick}
        >
          <div className="min-w-0">
            <h2 className="font-display text-sm sm:text-base font-semibold">{currentSlide.title}</h2>
            <p className="text-xs sm:text-sm text-muted">{currentSlide.desc}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {HOW_IT_WORKS_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === howItWorksSlide ? "w-8 sm:w-10 bg-brand" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Activities Tab Content ─── */}
      {activeTab === 0 && (
        <>
          {/* ─── Hero Banner + Profile ─── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
            <div className="rounded-2xl bg-white border border-border/60 shadow-card overflow-hidden">
              {/* Banner */}
              <div className="h-40 sm:h-56 relative">
                <Image src="/images/artist/ejae-press.webp" alt="EJAE" fill className="object-cover object-top" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              </div>
              {/* Profile row */}
              <div className="px-4 sm:px-6 pb-5 sm:pb-6 -mt-10 sm:-mt-12 relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white overflow-hidden shadow-card-lg bg-white shrink-0">
                    <Image src="/images/artist/ejae-time-after-time.jpg" alt="EJAE" width={96} height={96} className="h-full w-full object-cover" />
                  </div>
                  <div className="text-center sm:text-left flex-1 pt-1 sm:pt-2">
                    <h1 className="font-display text-xl sm:text-2xl font-bold">EJAE</h1>
                    <p className="text-muted text-xs sm:text-sm">R&B / Pop &middot; &ldquo;Time After Time&rdquo;</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Link href="/signup" className="btn-primary px-5 justify-center">Join Fan Club</Link>
                    <Link href="/api/spotify/connect" className="btn-secondary px-4 justify-center">Connect Spotify</Link>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-xl bg-surface2 border border-border/40 px-2 sm:px-4 py-2.5 sm:py-3 text-center">
                    <div className="text-[10px] sm:text-xs text-muted font-medium">Total XP</div>
                    <div className={`font-display font-bold text-base sm:text-lg mt-0.5 transition-all duration-500 ${animatingXp ? "text-brand scale-110" : ""}`}>
                      {formattedXp}
                    </div>
                  </div>
                  <div className="rounded-xl bg-surface2 border border-border/40 px-2 sm:px-4 py-2.5 sm:py-3 text-center">
                    <div className="text-[10px] sm:text-xs text-muted font-medium">Membership</div>
                    <div className="font-display font-bold text-base sm:text-lg mt-0.5">Free</div>
                  </div>
                  <div className="rounded-xl bg-surface2 border border-border/40 px-2 sm:px-4 py-2.5 sm:py-3 text-center">
                    <div className="text-[10px] sm:text-xs text-muted font-medium">Status</div>
                    <div className="font-display font-bold text-base sm:text-lg mt-0.5 text-brand">SUPERFAN</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                  <button onClick={handleInvite} className="btn-secondary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2">Invite Friends &middot; +300XP</button>
                  <button className="btn-secondary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2">Upgrade / Top-up</button>
                  <button className="btn-secondary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 sm:py-2">See Benefits</button>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Activity Members Row ─── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
            <div className="rounded-2xl bg-white border border-border/60 shadow-card p-5 overflow-hidden">
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
                {[
                  { name: "Jacques", points: "1.8K", color: "bg-brand" },
                  { name: "Lauren", points: "1.5K", color: "bg-lavender-400" },
                  { name: "Kristine", points: "1.2K", color: "bg-pink" },
                  { name: "Tracey", points: "980", color: "bg-accent" },
                  { name: "Marco", points: "870", color: "bg-lavender-500" },
                  { name: "Alex", points: "750", color: "bg-brand-400" },
                ].map((m, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="relative">
                      <div className={`h-14 w-14 rounded-full ${m.color} grid place-items-center text-white font-bold text-lg`}>
                        {m.name[0]}
                      </div>
                      {i === 0 && <div className="absolute -top-1 -right-1 badge text-[8px] px-1 min-w-[16px] h-4 bg-warning text-black">1st</div>}
                    </div>
                    <div className="text-xs font-medium text-center truncate w-16">{m.name}</div>
                    <div className="text-[10px] text-muted">Earn points for</div>
                    <div className="text-[10px] text-muted">music & vibes</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Fans Leaderboard ─── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
            <div className="rounded-2xl bg-white border border-border/60 shadow-card overflow-hidden">
              {/* Header */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-brand-50 grid place-items-center text-brand font-bold text-xs sm:text-sm shrink-0">E</div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-sm sm:text-base">FANS LEADERBOARD</h3>
                      <p className="text-[11px] sm:text-xs text-muted">Winner Gets 2 Concert Tickets And Pre-Show Artist Meet And Greet</p>
                      <p className="text-[10px] text-muted mt-0.5">4 Days left</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0 self-end sm:self-auto">
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-50 text-brand">Weekly</button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted hover:bg-surface2">Monthly</button>
                  </div>
                </div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-border/40">
                {[
                  { rank: 1, name: "Roman Wesley", points: "1900" },
                  { rank: 2, name: "Julia Hanner", points: "1700" },
                  { rank: 3, name: "Jenny Wilson", points: "1500" },
                  { rank: "12", name: "You", points: formattedXp, isYou: true },
                ].map((r, i) => (
                  <div key={i} className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3 ${r.isYou ? "bg-brand-50/50" : "hover:bg-surface2/50"} transition-colors`}>
                    <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full grid place-items-center text-xs sm:text-sm font-bold shrink-0 ${r.rank <= 3 ? "bg-brand text-white" : "bg-surface2 text-muted"}`}>
                      {r.rank}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full grid place-items-center text-white text-[10px] sm:text-xs font-bold shrink-0 ${r.isYou ? "bg-brand" : "bg-lavender-400"}`}>
                        {r.name[0]}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium truncate ${r.isYou ? "text-brand font-semibold" : ""}`}>{r.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-muted shrink-0">{r.points}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 sm:px-5 py-3 border-t border-border/40">
                <button className="text-xs sm:text-sm text-brand font-medium hover:text-brand-600 transition">Full Leaderboard &rarr;</button>
              </div>
            </div>
          </section>

          {/* ─── Interact to Unlock Rewards ─── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="font-display text-base sm:text-xl font-bold flex items-center gap-2">
                <span className="text-brand">+</span> Interact to Unlock Rewards
              </h2>
              <div className="flex gap-1">
                <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-border grid place-items-center text-muted hover:text-brand hover:border-brand transition text-sm">&larr;</button>
                <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-border grid place-items-center text-muted hover:text-brand hover:border-brand transition text-sm">&rarr;</button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {[
                { status: "Open", title: "What's the highest note EJAE can sing?", type: "Trivia", reward: "100XP", image: null },
                { status: "Open", title: "EJAE listening party + fan Q&A", type: "Event", reward: "500XP", image: "/images/artist/ejae-press.webp" },
                { status: "Completed", title: "EJAE Trivia: Play to Earn Points and unlock achievements", type: "Trivia", reward: "500XP", image: "/images/artist/ejae-time-after-time.jpg" },
              ].map((card, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${card.status === "Completed" ? "bg-success/10 text-success" : "bg-brand-50 text-brand"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${card.status === "Completed" ? "bg-success" : "bg-brand"}`} />
                      {card.status}
                    </span>
                  </div>
                  <div className="p-4">
                    {card.image ? (
                      <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                        <Image src={card.image} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="space-y-2 mb-3">
                        <p className="font-medium text-sm">{card.title}</p>
                        {TRIVIA_OPTIONS.map((opt, j) => {
                          let borderClass = "border-border/60 hover:border-brand/30";
                          let bgClass = "";
                          if (triviaAnswer) {
                            if (opt === triviaAnswer) {
                              if (opt === CORRECT_ANSWER) {
                                borderClass = "border-success";
                                bgClass = "bg-success/10";
                              } else {
                                borderClass = "border-red-500";
                                bgClass = "bg-red-50";
                              }
                            } else if (opt === CORRECT_ANSWER) {
                              // Show correct answer highlighted when user picks wrong
                              borderClass = "border-success";
                              bgClass = "bg-success/10";
                            }
                          }
                          return (
                            <div
                              key={j}
                              onClick={() => handleTriviaAnswer(opt)}
                              className={`text-xs text-muted px-3 py-2 rounded-lg border ${borderClass} ${bgClass} cursor-pointer transition`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {card.image && (
                      <>
                        <p className="font-medium text-sm mb-2">{card.title}</p>
                        <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${card.status === "Completed" ? "bg-success/10 text-success" : "bg-brand text-white hover:bg-brand-600"}`}>
                          {card.status === "Completed" ? "Play Now" : "Check In Now"}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-muted">Rewards</div>
                      <span className="chip text-[10px] py-0.5 mt-0.5">{card.reward}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted">Requirements</div>
                      <span className="text-[10px] text-muted mt-0.5">Free</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ─── Announcements Tab Content ─── */}
      {activeTab === 2 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
          <div className="rounded-2xl bg-white border border-border/60 shadow-card p-8 sm:p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 grid place-items-center mx-auto mb-4">
              <svg className="h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold mb-2">No Announcements Yet</h3>
            <p className="text-sm text-muted max-w-md mx-auto">
              Stay tuned! EJAE will post announcements about upcoming releases, events, and exclusive fan content here.
            </p>
          </div>
        </section>
      )}

      {/* ─── Rewards ─── (always visible, serves as scroll target for Rewards tab) */}
      <section ref={rewardsSectionRef} className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-display text-base sm:text-xl font-bold flex items-center gap-2">
            <span className="text-brand">+</span> Rewards
          </h2>
          <div className="flex gap-1">
            <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-border grid place-items-center text-muted hover:text-brand hover:border-brand transition text-sm">&larr;</button>
            <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-border grid place-items-center text-muted hover:text-brand hover:border-brand transition text-sm">&rarr;</button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[
            { title: "Limited Edition Merch", subtitle: "Tuesday, May 10 | 03:43", cta: "Claim Now", req: "1000XP", image: "/images/artist/ejae-press.webp" },
            { title: "Discounted Tickets", subtitle: null, cta: "Claim Now", req: "2000XP", image: "/images/artist/ejae-portrait.jpeg" },
            { title: "Discounted Tickets", subtitle: null, cta: "Claim Now", req: "4000XP", image: "/images/artist/ejae-time-after-time.jpg" },
          ].map((card, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="relative">
                <div className="h-48 relative">
                  <Image src={card.image} alt="" fill className="object-cover" />
                </div>
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />Open
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">{card.title}</h3>
                {card.subtitle && <p className="text-xs text-muted mt-0.5">{card.subtitle}</p>}
                <button
                  onClick={() => handleClaim(card.req)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-600 transition"
                >
                  {card.cta}
                </button>
              </div>
              <div className="px-4 py-3 border-t border-border/40">
                <div className="text-[10px] text-muted">Requirements</div>
                <span className="chip text-[10px] py-0.5 mt-0.5">{card.req}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Link Apps ─── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="font-display text-base sm:text-xl font-bold flex items-center gap-2 mb-1">
          <span className="text-brand">+</span> Link Apps
        </h2>
        <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-5">Link your apps and use these hashtags so we can reward your fandom <span className="text-brand font-medium">#EJAE</span> <span className="text-brand font-medium">#TimeAfterTime</span></p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Link href="https://open.spotify.com/search/EJAE" target="_blank" rel="noreferrer" className="card-hover flex flex-col items-center justify-center py-6 sm:py-10 group">
            <svg viewBox="0 0 24 24" className="h-10 w-10 sm:h-16 sm:w-16 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" fill="#1DB954"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.8.8 0 01-1.1.3c-3-1.8-6.8-2.2-11.3-1.2a.8.8 0 11-.3-1.5c4.9-1.1 9.1-.6 12.4 1.3.4.2.5.7.3 1.1zm1.2-2.7a1 1 0 01-1.3.3c-3.5-2.1-8.7-2.7-12.8-1.5a1 1 0 01-.6-1.9c4.6-1.4 10.4-.7 14.4 1.7.5.3.6.9.3 1.4zm.1-2.8C14 8.6 7.6 8.4 3.8 9.5a1.2 1.2 0 11-.7-2.3C7.6 5.9 14.7 6.1 19.1 8.7a1.2 1.2 0 01-1.2 2.2z"/></svg>
            <div className="font-display font-semibold text-xs sm:text-base">Spotify</div>
          </Link>
          <Link href="https://www.tiktok.com/@ejaemusic" target="_blank" rel="noreferrer" className="card-hover flex flex-col items-center justify-center py-6 sm:py-10 group">
            <svg viewBox="0 0 24 24" className="h-10 w-10 sm:h-16 sm:w-16 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" fill="#1A1525"><path d="M20 8.3a6.7 6.7 0 01-4-1.3v7.7a5.7 5.7 0 11-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 102 2.8V2h2.8A4.2 4.2 0 0020 6.1v2.2z"/></svg>
            <div className="font-display font-semibold text-xs sm:text-base">TikTok</div>
          </Link>
          <Link href="https://www.instagram.com/ejaemusic" target="_blank" rel="noreferrer" className="card-hover flex flex-col items-center justify-center py-6 sm:py-10 group">
            <svg viewBox="0 0 24 24" className="h-10 w-10 sm:h-16 sm:w-16 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="#E1306C" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="#E1306C"/></svg>
            <div className="font-display font-semibold text-xs sm:text-base">Instagram</div>
          </Link>
        </div>
      </section>

      {/* ─── Toast ─── */}
      <Toast message={toastMsg} show={showToast} onClose={closeToast} />
    </>
  );
}
