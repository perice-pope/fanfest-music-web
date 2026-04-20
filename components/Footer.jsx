import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-20 bg-gradient-footer text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold tracking-tight uppercase">EJAE</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <Link href="/chat" className="hover:text-white transition">Chat</Link>
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="/profile" className="hover:text-white transition">Profile</Link>
          <Link href="https://open.spotify.com/search/EJAE" target="_blank" rel="noreferrer" className="hover:text-white transition">Listen</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://open.spotify.com/search/EJAE" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.8.8 0 01-1.1.3c-3-1.8-6.8-2.2-11.3-1.2a.8.8 0 11-.3-1.5c4.9-1.1 9.1-.6 12.4 1.3.4.2.5.7.3 1.1zm1.2-2.7a1 1 0 01-1.3.3c-3.5-2.1-8.7-2.7-12.8-1.5a1 1 0 01-.6-1.9c4.6-1.4 10.4-.7 14.4 1.7.5.3.6.9.3 1.4zm.1-2.8C14 8.6 7.6 8.4 3.8 9.5a1.2 1.2 0 11-.7-2.3C7.6 5.9 14.7 6.1 19.1 8.7a1.2 1.2 0 01-1.2 2.2z"/></svg>
          </Link>
          <Link href="https://www.tiktok.com/@ejaemusic" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20 8.3a6.7 6.7 0 01-4-1.3v7.7a5.7 5.7 0 11-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 102 2.8V2h2.8A4.2 4.2 0 0020 6.1v2.2z"/></svg>
          </Link>
          <Link href="https://www.instagram.com/ejaemusic" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white transition">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>
          </Link>
        </div>
        <div className="text-xs text-white/30">&copy; {new Date().getFullYear()} FansFest &middot; EJAE. All rights reserved.</div>
      </div>
    </footer>
  );
}
