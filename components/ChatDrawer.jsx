"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@/components/ChatProvider";

/* ─── Room data ─── */
const ROOMS = [
  { id: 1, name: "EJAE Official Fan Club", members: 20000, online: 1067, color: "bg-mauve", host: "Amanda", newMessages: 1067 },
  { id: 2, name: "Stan Club", members: 4500, online: 312, color: "bg-mauve-400", host: "Jenny", newMessages: 87 },
  { id: 3, name: "New Music Discussion", members: 3400, online: 154, color: "bg-mauve-300", host: "Marco", newMessages: 42 },
  { id: 4, name: "Concert Meetups", members: 2800, online: 88, color: "bg-mauve-500", host: "Lauren", newMessages: 19 },
];

const TOTAL_ONLINE = ROOMS.reduce((sum, r) => sum + r.online, 0);

// Per-user XP awarded for chat activity (matches Figma)
const USER_XP = {
  Jacques: 50, Lauren: 50, Kristine: 30, Marco: 25, Alex: 50,
  Jenny: 50, Devon: 30, Talia: 25, Amanda: 100, Pierre: 75,
};
function getUserXP(name) { return USER_XP[name] ?? 25; }

/* ─── Demo users ─── */
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

/* ─── Per-room seed messages ─── */
const ROOM_MESSAGES = {
  1: [
    { user: "Jacques", body: "EJAE's new track is absolutely fire. Been playing Time After Time on repeat all day", minutesAgo: 38 },
    { user: "Lauren", body: "The harmonies on track 3 of the EP are unreal. She really outdid herself", minutesAgo: 28 },
    { user: "Kristine", body: "I love how she interacts with fans on here. Feels like a real community", minutesAgo: 18 },
    { user: "Marco", body: "Anyone else notice the hidden sample in Midnight Drive? Genius production", minutesAgo: 10 },
    { user: "Alex", body: "Welcome to all the new members! You picked the best fan club to join", minutesAgo: 4 },
  ],
  2: [
    { user: "Jenny", body: "Stan check! Who else has listened to the full discography this week?", minutesAgo: 45 },
    { user: "Devon", body: "Guilty. I made a 6-hour playlist of every EJAE feature and solo track", minutesAgo: 35 },
    { user: "Talia", body: "Does anyone have the fan art from last week's contest? I missed the deadline", minutesAgo: 22 },
    { user: "Lauren", body: "I'll post it in a bit! The winner's piece was incredible", minutesAgo: 15 },
    { user: "Jacques", body: "We should organize a group stream party for the next single drop", minutesAgo: 6 },
  ],
  3: [
    { user: "Marco", body: "What do you all think about the new wave of R&B coming out this year?", minutesAgo: 50 },
    { user: "Alex", body: "It's great but EJAE is still in a league of her own. The vocal control is unmatched", minutesAgo: 40 },
    { user: "Kristine", body: "I've been getting into jazz-influenced R&B lately. Any recommendations?", minutesAgo: 25 },
    { user: "Devon", body: "Check out the latest EP from Moonchild! Similar vibes to EJAE's earlier stuff", minutesAgo: 16 },
    { user: "Talia", body: "The bridge on Midnight Drive blends jazz chords so smoothly. That key change is chef's kiss", minutesAgo: 7 },
  ],
  4: [
    { user: "Lauren", body: "Is anyone going to the LA show in June? I'm trying to get a group together!", minutesAgo: 55 },
    { user: "Jacques", body: "Count me in! I went to the last one and it was the best concert I've ever been to", minutesAgo: 42 },
    { user: "Jenny", body: "I'm flying in from Chicago! Would love to meet up with other fans beforehand", minutesAgo: 30 },
    { user: "Marco", body: "We should get matching fan shirts made. I know someone who does custom prints", minutesAgo: 18 },
    { user: "Alex", body: "Just snagged floor seats from the leaderboard reward. See you all there!", minutesAgo: 5 },
  ],
};

const AUTO_REPLIES = [
  "Welcome!",
  "That's awesome!",
  "Love that energy!",
  "So true!!",
  "Haha yes",
  "Big facts",
  "Couldn't agree more!",
  "You're gonna love it here",
  "W take honestly",
  "Yesss let's gooo!",
  "Real ones know",
  "This community is the best fr",
];

function getUserByName(name) {
  return DEMO_USERS.find((u) => u.name === name) || DEMO_USERS[0];
}

function formatRelativeTime(minutesAgo) {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo === 1) return "1m ago";
  if (minutesAgo < 60) return `${Math.floor(minutesAgo)}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours === 1) return "1h ago";
  return `${hours}h ago`;
}

/* ═══════════════════════════════════════════
   ChatDrawer Component
   ═══════════════════════════════════════════ */
export default function ChatDrawer() {
  const { isOpen, openChat, closeChat } = useChat();
  const [activeRoom, setActiveRoom] = useState(null); // null = room list, number = room id
  const [searchQuery, setSearchQuery] = useState("");
  const [roomMessages, setRoomMessages] = useState({}); // { [roomId]: Message[] }
  const [body, setBody] = useState("");
  const [viewTransition, setViewTransition] = useState("list"); // "list" | "chat"
  const listRef = useRef(null);
  const replyTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Initialize messages for all rooms on mount ── */
  useEffect(() => {
    const now = Date.now();
    const initial = {};
    for (const [roomId, seeds] of Object.entries(ROOM_MESSAGES)) {
      initial[roomId] = seeds.map((m, i) => ({
        id: `seed-${roomId}-${i}`,
        body: m.body,
        userName: m.user,
        isGuest: false,
        createdAt: now - m.minutesAgo * 60 * 1000,
      }));
    }
    setRoomMessages(initial);
  }, []);

  /* ── Scroll to bottom when messages change ── */
  useEffect(() => {
    if (activeRoom && listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [activeRoom, roomMessages]);

  /* ── Cleanup reply timeout ── */
  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  /* ── Focus input when entering a room ── */
  useEffect(() => {
    if (activeRoom && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [activeRoom]);

  /* ── Enter a room ── */
  const enterRoom = useCallback((roomId) => {
    setViewTransition("chat");
    setActiveRoom(roomId);
    setBody("");
  }, []);

  /* ── Back to room list ── */
  const backToList = useCallback(() => {
    setViewTransition("list");
    setActiveRoom(null);
    setSearchQuery("");
  }, []);

  /* ── Send message ── */
  const send = useCallback(
    (e) => {
      e.preventDefault();
      const text = body.trim();
      if (!text || !activeRoom) return;

      const guestMsg = {
        id: `guest-${Date.now()}`,
        body: text,
        userName: "You",
        isGuest: true,
        createdAt: Date.now(),
      };
      setRoomMessages((prev) => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), guestMsg],
      }));
      setBody("");

      // Auto-reply after 2-3 seconds
      const delay = 2000 + Math.random() * 1000;
      replyTimeoutRef.current = setTimeout(() => {
        const replyUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
        const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        setRoomMessages((prev) => ({
          ...prev,
          [activeRoom]: [
            ...(prev[activeRoom] || []),
            {
              id: `reply-${Date.now()}`,
              body: replyText,
              userName: replyUser.name,
              isGuest: false,
              createdAt: Date.now(),
            },
          ],
        }));
      }, delay);
    },
    [body, activeRoom]
  );

  /* ── Get timestamp ── */
  function getTimestamp(createdAt) {
    const minutesAgo = (Date.now() - createdAt) / 60000;
    return formatRelativeTime(minutesAgo);
  }

  /* ── Filtered rooms ── */
  const filteredRooms = ROOMS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Current room info ── */
  const currentRoom = ROOMS.find((r) => r.id === activeRoom);
  const currentMessages = activeRoom ? roomMessages[activeRoom] || [] : [];

  return (
    <>
      {/* ── Floating Chat Button ── */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-mauve text-white shadow-card-lg hover:bg-mauve-600 hover:shadow-glow grid place-items-center transition-all duration-200 active:scale-95"
          aria-label="Open chat rooms"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center ring-2 ring-white">
            4
          </span>
        </button>
      )}

      {/* ── Backdrop overlay ── */}
      <div
        onClick={closeChat}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[380px] bg-white shadow-card-lg flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ─────── ROOM LIST VIEW ─────── */}
        <div
          className={`absolute inset-0 flex flex-col transition-all duration-300 ${
            activeRoom !== null
              ? "opacity-0 pointer-events-none -translate-x-8"
              : "opacity-100 translate-x-0"
          }`}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between shrink-0">
            <h2 className="font-display text-lg font-bold tracking-tight">CHAT ROOMS</h2>
            <button
              onClick={closeChat}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brand transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              CLOSE CHAT
            </button>
          </div>

          {/* Online indicator */}
          <div className="px-5 py-3 flex items-center gap-3 border-b border-border/30">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {["jacques", "lauren", "kristine", "marco"].map((u, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-white"
                >
                  <img src={`https://i.pravatar.cc/64?u=${u}`} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-muted">{TOTAL_ONLINE.toLocaleString()} online</span>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-border/30">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a chat room here...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pr-10 text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg bg-brand text-white grid place-items-center hover:bg-brand-600 transition">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Room list */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => enterRoom(room.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-mauve/5 hover:bg-mauve/10 border border-mauve/10 transition-all duration-200 group hover:shadow-sm"
              >
                {/* Room avatar */}
                <div
                  className={`h-10 w-10 rounded-full ${room.color} grid place-items-center text-white font-bold text-sm shrink-0`}
                >
                  {room.name[0]}
                </div>
                {/* Room info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="font-display font-semibold text-sm text-text truncate">
                    {room.name}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {room.members.toLocaleString()} members &middot;{" "}
                    <span className="text-success">{room.online.toLocaleString()} online</span>
                  </div>
                </div>
                {/* Chevron */}
                <svg
                  className="h-4 w-4 text-muted group-hover:text-mauve transition shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}

            {filteredRooms.length === 0 && (
              <div className="text-center py-8 text-sm text-muted">No rooms match your search.</div>
            )}
          </div>
        </div>

        {/* ─────── CHAT VIEW ─────── */}
        <div
          className={`absolute inset-0 flex flex-col transition-all duration-300 ${
            activeRoom !== null
              ? "opacity-100 translate-x-0"
              : "opacity-0 pointer-events-none translate-x-8"
          }`}
        >
          {/* Chat header */}
          <div className="px-4 py-3.5 border-b border-border/60 flex items-center gap-3 shrink-0">
            <button
              onClick={backToList}
              className="h-8 w-8 rounded-lg hover:bg-surface2 grid place-items-center text-muted hover:text-brand transition shrink-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-sm truncate">
                {currentRoom?.name || "Chat"}
              </div>
              <div className="text-[11px] text-muted">
                {currentRoom?.members.toLocaleString()} members &middot;{" "}
                <span className="text-success">{currentRoom?.online.toLocaleString()} online</span>
              </div>
            </div>
            <span className="chip text-[10px] py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              live
            </span>
          </div>

          {/* Room banner photo */}
          <div className="px-4 pt-3 shrink-0">
            <div className="relative h-32 w-full rounded-2xl overflow-hidden">
              <img
                src="/images/artist/ejae-press.webp"
                alt={currentRoom?.name || "Room"}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>

          {/* Room summary card */}
          {currentRoom && (
            <div className="px-4 pt-3 shrink-0">
              <div className="rounded-2xl bg-figmaGray p-4 space-y-2.5">
                <div className="font-display font-bold text-[15px] tracking-tight uppercase text-black">
                  {currentRoom.name}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 min-w-[28px] px-1.5 rounded-md bg-mauve text-white text-[11px] font-bold">
                    {currentRoom.newMessages.toLocaleString()}
                  </span>
                  <span className="text-xs text-black">New Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={`https://i.pravatar.cc/48?u=${currentRoom.host.toLowerCase()}`}
                    alt={currentRoom.host}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-black">Hosted by {currentRoom.host}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["jacques", "lauren", "kristine"].map((u) => (
                      <img
                        key={u}
                        src={`https://i.pravatar.cc/48?u=${u}`}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover ring-2 ring-figmaGray"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-black">{currentRoom.members.toLocaleString()} People</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-white">
            {currentMessages.map((m) => {
              const isMe = m.isGuest;
              const user = isMe ? null : getUserByName(m.userName);
              const name = isMe ? "You" : m.userName;
              const userXp = isMe ? null : getUserXP(name);
              return (
                <div key={m.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`h-7 w-7 shrink-0 rounded-full overflow-hidden ${isMe ? "ring-2 ring-mauve" : ""}`}
                  >
                    <img src={`https://i.pravatar.cc/56?u=${isMe ? "guest" : name.toLowerCase()}`} alt={name} className="h-full w-full object-cover" />
                  </div>
                  <div className={`max-w-[78%] ${isMe ? "text-right" : ""}`}>
                    <div className={`flex items-center gap-1.5 mb-0.5 ${isMe ? "justify-end" : ""}`}>
                      <span className={`text-[11px] font-display font-medium ${isMe ? "text-mauve" : "text-black"}`}>
                        {name}
                      </span>
                      {!isMe && userXp != null && (
                        <span className="inline-flex items-center gap-1 bg-white border border-figmaGray rounded-full pl-0.5 pr-2 py-0.5 font-display font-semibold text-[11px] text-black">
                          <span
                            className="inline-block h-3 w-3 rounded-full ring-[0.5px] ring-black/40 shrink-0"
                            style={{ background: "linear-gradient(135deg, #ffca17 0%, #977400 100%)" }}
                            aria-hidden="true"
                          />
                          {userXp}XP
                        </span>
                      )}
                      <span className="text-[9px] text-muted/60">{getTimestamp(m.createdAt)}</span>
                    </div>
                    <div
                      className={`inline-block rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                        isMe
                          ? "bg-mauve text-white rounded-br-md"
                          : "bg-figmaGray text-black rounded-bl-md"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message input */}
          <form onSubmit={send} className="border-t border-border/60 p-3 flex gap-2 shrink-0 bg-white">
            <input
              ref={inputRef}
              className="input flex-1 text-sm"
              placeholder="Say something..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button
              disabled={!body.trim()}
              className="inline-flex items-center justify-center bg-mauve text-white rounded-xl px-4 py-2.5 hover:bg-mauve-600 transition disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
