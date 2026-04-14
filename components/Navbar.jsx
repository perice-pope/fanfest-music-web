import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand grid place-items-center text-black font-black">F</div>
          <span className="font-display text-lg font-semibold tracking-tight">FansFest</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link href="/chat" className="btn-ghost">Chat</Link>
          <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          <Link href="/profile" className="btn-ghost">Profile</Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <form action="/auth/signout" method="post">
              <button className="btn-secondary">Sign out</button>
            </form>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
              <Link href="/signup" className="btn-primary">Join</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
