import Link from "next/link";

const sample = [
  { user: "Maya", text: "Just grabbed presale — see everyone Friday 🎶", color: "bg-accent" },
  { user: "Devon", text: "Who's down for a listening party tonight?", color: "bg-brand" },
  { user: "Sasha", text: "Dropped a new demo in my Spotify — thoughts?", color: "bg-pink-500" },
];

export default function ChatPreview() {
  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted">The Lounge</div>
          <div className="font-display text-lg font-semibold">Live fan chat</div>
        </div>
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          live
        </span>
      </div>
      <ul className="space-y-3">
        {sample.map((m, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={`h-8 w-8 shrink-0 rounded-full ${m.color} grid place-items-center text-black text-sm font-semibold`}>
              {m.user[0]}
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted mb-0.5">{m.user}</div>
              <div className="inline-block rounded-xl bg-surface2 border border-border px-3.5 py-2 text-sm">
                {m.text}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-2">
        <div className="input opacity-80 pointer-events-none flex-1">Say something…</div>
        <Link href="/chat" className="btn-primary">Join chat</Link>
      </div>
    </div>
  );
}
