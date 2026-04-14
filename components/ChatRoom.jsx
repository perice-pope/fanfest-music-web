"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChatRoom({ roomId, currentUser, initialMessages, profilesById }) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(initialMessages || []);
  const [profiles, setProfiles] = useState(profilesById || {});
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const msg = payload.new;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (!profiles[msg.user_id]) {
            const { data } = await supabase.from("profiles").select("id,display_name,avatar_url").eq("id", msg.user_id).maybeSingle();
            if (data) setProfiles((p) => ({ ...p, [data.id]: data }));
          }
        }
      )
      .subscribe();
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
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      alert(error.message);
    }
  }

  return (
    <div className="card flex flex-col h-[70vh] md:h-[75vh] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">Room</div>
          <div className="font-display font-semibold">The Lounge</div>
        </div>
        <span className="chip"><span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />live</span>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="font-display text-lg">Say hi 👋</div>
              <div className="text-sm text-muted mt-1">Be the first to post in The Lounge.</div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.user_id === currentUser.id;
            const prof = profiles[m.user_id];
            const name = prof?.display_name || "Member";
            return (
              <div key={m.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 shrink-0 rounded-full grid place-items-center text-black text-sm font-semibold ${isMe ? "bg-brand" : "bg-accent"}`}>
                  {name[0]?.toUpperCase() || "?"}
                </div>
                <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
                  <div className="text-xs text-muted mb-0.5">{isMe ? "You" : name}</div>
                  <div className={`inline-block rounded-2xl px-3.5 py-2 text-sm ${isMe ? "bg-brand text-black" : "bg-surface2 border border-border"} ${m._optimistic ? "opacity-70" : ""}`}>
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
        <input className="input flex-1" placeholder="Say something…" value={body} onChange={(e) => setBody(e.target.value)} />
        <button disabled={sending || !body.trim()} className="btn-primary px-5">Send</button>
      </form>
    </div>
  );
}
