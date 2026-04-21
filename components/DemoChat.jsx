"use client";
import { useEffect, useRef, useState } from "react";

const DEMO_USERS = [
  { name: "Jacques", color: "bg-purple-500" },
  { name: "Lauren", color: "bg-pink-400" },
  { name: "Kristine", color: "bg-amber-500" },
  { name: "Marco", color: "bg-emerald-500" },
  { name: "Alex", color: "bg-sky-500" },
  { name: "Jenny", color: "bg-rose-400" },
  { name: "Devon", color: "bg-indigo-400" },
  { name: "Talia", color: "bg-teal-400" },
];

const SEED_MESSAGES = [
  { user: "Jacques", body: "EJAE's new track is absolutely fire \u{1F525} Been playing Time After Time on repeat all day", minutesAgo: 38 },
  { user: "Lauren", body: "Has anyone seen the concert lineup? I heard there might be a surprise collab", minutesAgo: 31 },
  { user: "Kristine", body: "Just earned 500XP from the trivia! Those music theory questions are tough \u{1F605}", minutesAgo: 24 },
  { user: "Marco", body: "who else is trying to get those concert tickets from the leaderboard?? 4 days left!", minutesAgo: 19 },
  { user: "Alex", body: "The meet and greet reward is so worth grinding for. Last time she stayed for like an hour talking to fans", minutesAgo: 14 },
  { user: "Jenny", body: "New here! Just connected my Spotify. This community is amazing \u{1F49C}", minutesAgo: 10 },
  { user: "Devon", body: "Welcome Jenny! You picked a great time to join, big stuff coming this week", minutesAgo: 8 },
  { user: "Talia", body: "the production on the new EP is next level honestly. those harmonies in track 3 \u{1F3B6}", minutesAgo: 5 },
  { user: "Jacques", body: "Facts Talia!! And the bridge on Midnight Drive? chills every time", minutesAgo: 3 },
  { user: "Marco", body: "anyone in the top 10 leaderboard rn wanna squad up for the trivia tonight? \u{1F4AA}", minutesAgo: 1 },
];

const AUTO_REPLIES = [
  "Welcome! \u{1F49C}",
  "That's awesome!",
  "Love that energy!",
  "So true!!",
  "Haha yes \u{1F602}",
  "Big facts \u{1F525}",
  "Couldn't agree more!",
  "You're gonna love it here \u{1F64C}",
  "W take honestly",
  "Yesss let's gooo!",
  "Real ones know \u{1F4AF}",
  "This community is the best fr",
];

function formatRelativeTime(minutesAgo) {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo === 1) return "1m ago";
  if (minutesAgo < 60) return `${Math.floor(minutesAgo)}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours === 1) return "1h ago";
  return `${hours}h ago`;
}

function getUserByName(name) {
  return DEMO_USERS.find((u) => u.name === name) || DEMO_USERS[0];
}

export default function DemoChat() {
  const [messages, setMessages] = useState(() => {
    const now = Date.now();
    return SEED_MESSAGES.map((m, i) => ({
      id: `seed-${i}`,
      body: m.body,
      userName: m.user,
      isGuest: false,
      createdAt: now - m.minutesAgo * 60 * 1000,
    }));
  });
  const [body, setBody] = useState("");
  const listRef = useRef(null);
  const replyTimeoutRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  function send(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    const guestMsg = {
      id: `guest-${Date.now()}`,
      body: text,
      userName: "You",
      isGuest: true,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, guestMsg]);
    setBody("");

    // Simulate a reply after 2-3 seconds
    const delay = 2000 + Math.random() * 1000;
    replyTimeoutRef.current = setTimeout(() => {
      const replyUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          body: replyText,
          userName: replyUser.name,
          isGuest: false,
          createdAt: Date.now(),
        },
      ]);
    }, delay);
  }

  function getTimestamp(createdAt) {
    const minutesAgo = (Date.now() - createdAt) / 60000;
    return formatRelativeTime(minutesAgo);
  }

  return (
    <div className="card flex flex-col h-[72vh] md:h-[76vh] overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 grid place-items-center text-brand">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
          </div>
          <div>
            <div className="font-display font-semibold">The Lounge</div>
            <div className="text-xs text-muted">142 members</div>
          </div>
        </div>
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          live
        </span>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-bg/50">
        {messages.map((m) => {
          const isMe = m.isGuest;
          const user = isMe ? null : getUserByName(m.userName);
          const name = isMe ? "You" : m.userName;
          return (
            <div key={m.id} className={`flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 shrink-0 rounded-full overflow-hidden ${isMe ? "ring-2 ring-brand" : ""}`}>
                <img src={`https://i.pravatar.cc/64?u=${isMe ? "guest" : name.toLowerCase()}`} alt={name} className="h-full w-full object-cover" />
              </div>
              <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className={`text-xs font-medium ${isMe ? "text-brand" : "text-muted"}`}>{name}</span>
                  <span className="text-[10px] text-muted/50">{getTimestamp(m.createdAt)}</span>
                </div>
                <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMe ? "bg-brand text-white rounded-br-md" : "bg-white border border-border/60 rounded-bl-md shadow-sm"
                }`}>
                  {m.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="border-t border-border/60 p-3 flex gap-2">
        <input className="input flex-1" placeholder="Say something..." value={body} onChange={(e) => setBody(e.target.value)} />
        <button disabled={!body.trim()} className="btn-primary px-5 disabled:opacity-40 disabled:shadow-none">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
        </button>
      </form>
    </div>
  );
}
