import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 bg-gradient-nav text-white shadow-lg">
      <nav className="mx-auto flex h-[58px] max-w-6xl items-center px-4 sm:px-6 relative">
        {/* Left nav items */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <span className="px-2.5 py-1 text-xs font-bold tracking-wider text-white uppercase">Live</span>
          <Link href="/signup" className="px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:text-white uppercase transition">Signup</Link>
        </div>

        {/* Center logo */}
        <Link href="/" className="flex items-center gap-2 group md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
          <span className="font-display text-xl font-bold tracking-tight uppercase">EJAE</span>
        </Link>

        {/* Right nav items */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
          <Link href="https://open.spotify.com/search/EJAE" target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:text-white uppercase transition">Listen</Link>
          <Link href="#" className="px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:text-white uppercase transition">Store</Link>
        </div>

        <div className="flex items-center gap-2 md:ml-4">
          {user ? (
            <>
              <Link href="/dashboard" className="md:hidden px-2 py-1.5 text-white/70 hover:text-white transition">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>
              </Link>
              <form action="/auth/signout" method="post">
                <button className="text-sm font-medium px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition">Sign in</Link>
              <Link href="/signup" className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-white text-[#3D2852] hover:bg-white/90 transition shadow-sm">Join</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
