"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChatRoom({ roomId, roomName, currentUser, initialMessages, profilesById }) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(initialMessages || []);
  const [profiles, setProfiles] = useState(profilesById || {});
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [memberCount] = useState(Object.keys(profilesById || {}).length);
  const listRef = useRef(null);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const msg = payload.new;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (!profiles[msg.user_id]) {
            const { data } = await supabase.from("profiles").select("id,display_name,avatar_url").eq("id", msg.user_id).maybeSingle();
            if (data) setProfiles((p) => ({ ...p, [data.id]: data }));
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, roomId]); // eslint-disable-line

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const optimistic = { id: `tmp-${Date.now()}`, room_id: roomId, user_id: currentUser.id, body: text, created_at: new Date().toISOString(), _optimistic: true };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    const { error } = await supabase.from("chat_messages").insert({ room_id: roomId, user_id: currentUser.id, body: text });
    setSending(false);
    if (error) setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return (
    <div className="card flex flex-col h-[72vh] md:h-[76vh] overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 grid place-items-center text-brand">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
          </div>
          <div>
            <div className="font-display font-semibold">{roomName || "The Lounge"}</div>
            <div className="text-xs text-muted">{memberCount} members</div>
          </div>
        </div>
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          live
        </span>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-bg/50">
        {messages.length === 0 ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-50 grid place-items-center text-brand mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
              </div>
              <div className="font-display text-xl font-semibold">Start the conversation</div>
              <div className="text-sm text-muted mt-1">Be the first to post in The Lounge.</div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.user_id === currentUser.id;
            const prof = profiles[m.user_id];
            const name = prof?.display_name || "Member";
            const avatarUrl = prof?.avatar_url;
            return (
              <div key={m.id} className={`flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className={`h-8 w-8 shrink-0 rounded-full grid place-items-center text-white text-xs font-bold ${isMe ? "bg-brand" : "bg-lavender-400"}`}>
                    {name[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className={`text-xs font-medium ${isMe ? "text-brand" : "text-muted"}`}>{isMe ? "You" : name}</span>
                    <span className="text-[10px] text-muted/50">{formatTime(m.created_at)}</span>
                  </div>
                  <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMe ? "bg-brand text-white rounded-br-md" : "bg-white border border-border/60 rounded-bl-md shadow-sm"
                  } ${m._optimistic ? "opacity-60" : ""}`}>
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="border-t border-border/60 p-3 flex gap-2">
        <input className="input flex-1" placeholder="Say something..." value={body} onChange={(e) => setBody(e.target.value)} />
        <button disabled={sending || !body.trim()} className="btn-primary px-5 disabled:opacity-40 disabled:shadow-none">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
        </button>
      </form>
    </div>
  );
}
