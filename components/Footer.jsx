import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-footer text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <span className="font-display text-2xl font-bold tracking-tight uppercase">EJAE</span>
        <div className="flex items-center gap-5 text-sm text-white/70">
          <Link href="/chat" className="hover:text-white transition">Chat</Link>
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="/profile" className="hover:text-white transition">Profile</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="#" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition grid place-items-center" aria-label="Facebook">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M13 22v-8h3l1-4h-4V7.5c0-1.2.3-2 2-2h2V2c-.3 0-1.5-.2-2.8-.2C11.5 1.8 10 3.7 10 7v3H7v4h3v8h3z"/></svg>
          </Link>
          <Link href="#" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition grid place-items-center" aria-label="X">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6 7H1.4l7.9-9L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 4H5.1l11.9 16z"/></svg>
          </Link>
          <Link href="https://www.instagram.com/ejaemusic" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition grid place-items-center" aria-label="Instagram">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>
          </Link>
          <Link href="#" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition grid place-items-center" aria-label="YouTube">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M22.5 6.5a2.7 2.7 0 00-1.9-1.9C18.8 4 12 4 12 4s-6.8 0-8.6.6A2.7 2.7 0 001.5 6.5C1 8.3 1 12 1 12s0 3.7.5 5.5c.3 1 1 1.7 1.9 1.9 1.8.6 8.6.6 8.6.6s6.8 0 8.6-.6a2.7 2.7 0 001.9-1.9c.5-1.8.5-5.5.5-5.5s0-3.7-.5-5.5zM9.7 15.3V8.7l5.7 3.3-5.7 3.3z"/></svg>
          </Link>
          <Link href="https://www.tiktok.com/@ejaemusic" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition grid place-items-center" aria-label="TikTok">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M20 8.3a6.7 6.7 0 01-4-1.3v7.7a5.7 5.7 0 11-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 102 2.8V2h2.8A4.2 4.2 0 0020 6.1v2.2z"/></svg>
          </Link>
          <Link href="https://open.spotify.com/search/EJAE" target="_blank" rel="noreferrer" className="h-7 w-7 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition grid place-items-center" aria-label="Spotify">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.8.8 0 01-1.1.3c-3-1.8-6.8-2.2-11.3-1.2a.8.8 0 11-.3-1.5c4.9-1.1 9.1-.6 12.4 1.3.4.2.5.7.3 1.1zm1.2-2.7a1 1 0 01-1.3.3c-3.5-2.1-8.7-2.7-12.8-1.5a1 1 0 01-.6-1.9c4.6-1.4 10.4-.7 14.4 1.7.5.3.6.9.3 1.4zm.1-2.8C14 8.6 7.6 8.4 3.8 9.5a1.2 1.2 0 11-.7-2.3C7.6 5.9 14.7 6.1 19.1 8.7a1.2 1.2 0 01-1.2 2.2z"/></svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
