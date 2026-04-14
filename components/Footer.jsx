import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-20 bg-gradient-nav text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center text-white font-black text-sm border border-white/20">F</div>
          <div>
            <div className="font-display font-bold">FansFest</div>
            <div className="text-xs text-white/50">Where fans and artists connect.</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <Link href="/chat" className="hover:text-white transition">Chat</Link>
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="/profile" className="hover:text-white transition">Profile</Link>
        </div>
        <div className="text-xs text-white/30">&copy; {new Date().getFullYear()} FansFest. All rights reserved.</div>
      </div>
    </footer>
  );
}
