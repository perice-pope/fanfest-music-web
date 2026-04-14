import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getValidAccessToken, spotifyFetch } from "@/lib/spotify";

export const dynamic = "force-dynamic";

/* ─── Demo / mock data ──────────────────────────────────────────────── */

const DEMO_ARTISTS = [
  { id: "d1", name: "Drake", genre: "Hip-Hop", color: "bg-amber-500" },
  { id: "d2", name: "SZA", genre: "R&B", color: "bg-rose-500" },
  { id: "d3", name: "The Weeknd", genre: "Pop", color: "bg-red-600" },
  { id: "d4", name: "Doja Cat", genre: "Pop Rap", color: "bg-pink-500" },
  { id: "d5", name: "Tyler the Creator", genre: "Hip-Hop", color: "bg-green-500" },
  { id: "d6", name: "Steve Lacy", genre: "R&B", color: "bg-indigo-500" },
];

const DEMO_TRACKS = [
  { id: "t1", name: "Snooze", artist: "SZA", color: "bg-rose-500" },
  { id: "t2", name: "Blinding Lights", artist: "The Weeknd", color: "bg-red-600" },
  { id: "t3", name: "Paint The Town Red", artist: "Doja Cat", color: "bg-pink-500" },
  { id: "t4", name: "HUMBLE.", artist: "Kendrick Lamar", color: "bg-orange-600" },
  { id: "t5", name: "Redbone", artist: "Childish Gambino", color: "bg-yellow-600" },
  { id: "t6", name: "Bad Habit", artist: "Steve Lacy", color: "bg-indigo-500" },
];

const DEMO_RECENT = [
  { id: "r1", name: "Snooze", artist: "SZA", color: "bg-rose-500", ago: "2m ago" },
  { id: "r2", name: "Blinding Lights", artist: "The Weeknd", color: "bg-red-600", ago: "15m ago" },
  { id: "r3", name: "Bad Habit", artist: "Steve Lacy", color: "bg-indigo-500", ago: "1h ago" },
  { id: "r4", name: "HUMBLE.", artist: "Kendrick Lamar", color: "bg-orange-600", ago: "3h ago" },
  { id: "r5", name: "Paint The Town Red", artist: "Doja Cat", color: "bg-pink-500", ago: "5h ago" },
  { id: "r6", name: "Redbone", artist: "Childish Gambino", color: "bg-yellow-600", ago: "1d ago" },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

async function loadSpotify(userId) {
  try {
    const service = createServiceClient();
    const tokens = await getValidAccessToken(service, userId);
    if (!tokens) return { connected: false };
    const [me, topArtists, topTracks, recent] = await Promise.all([
      spotifyFetch("/me", tokens.access_token),
      spotifyFetch("/me/top/artists?limit=6&time_range=short_term", tokens.access_token),
      spotifyFetch("/me/top/tracks?limit=6&time_range=short_term", tokens.access_token),
      spotifyFetch("/me/player/recently-played?limit=8", tokens.access_token).catch(() => ({ items: [] })),
    ]);
    return { connected: true, me, topArtists: topArtists.items, topTracks: topTracks.items, recent: recent.items || [] };
  } catch (e) {
    return { connected: true, error: e.message };
  }
}

function SpotifyCard({ children, className = "" }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function LetterAvatar({ letter, colorClass, size = "h-10 w-10", textSize = "text-sm" }) {
  return (
    <div className={`${size} rounded-lg ${colorClass} grid place-items-center text-white font-bold ${textSize}`}>
      {letter}
    </div>
  );
}

/* ─── Demo dashboard (no auth) ───────────────────────────────────────── */

function DemoDashboard() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Demo banner */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
        <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <span className="text-sm text-amber-800">
          You&apos;re viewing demo data.{" "}
          <Link href="/login" className="font-semibold underline underline-offset-2 hover:text-amber-900">
            Sign in
          </Link>{" "}
          to connect your real Spotify.
        </span>
      </div>

      {/* Profile card + stats */}
      <div className="grid md:grid-cols-[1fr_auto] gap-4">
        <SpotifyCard className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-brand grid place-items-center text-white font-bold text-xl">D</div>
          <div>
            <div className="font-display font-bold text-lg">Demo User</div>
            <div className="text-xs text-muted flex items-center gap-2">
              <span className="chip text-[10px] py-0.5 px-2 bg-[#1DB954]/10 border-[#1DB954]/20 text-[#1DB954]">Spotify</span>
              42 followers &middot; US
            </div>
          </div>
        </SpotifyCard>
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 text-center"><div className="text-xs text-muted font-medium">Top Artists</div><div className="font-display text-xl font-bold">6</div></div>
          <div className="card p-4 text-center"><div className="text-xs text-muted font-medium">Recent</div><div className="font-display text-xl font-bold">6</div></div>
        </div>
      </div>

      {/* Top Artists */}
      <SpotifyCard>
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-semibold">Top Artists</div>
          <span className="chip text-[10px]">short term</span>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DEMO_ARTISTS.map(a => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border/40 p-2.5 hover:border-brand/30 transition-colors">
              <LetterAvatar letter={a.name[0]} colorClass={a.color} />
              <div className="min-w-0"><div className="text-sm font-semibold truncate">{a.name}</div><div className="text-xs text-muted truncate">{a.genre}</div></div>
            </li>
          ))}
        </ul>
      </SpotifyCard>

      {/* Top Tracks */}
      <SpotifyCard>
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-semibold">Top Tracks</div>
          <span className="chip text-[10px]">short term</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_TRACKS.map(t => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border/40 p-2.5 hover:border-brand/30 transition-colors">
              <LetterAvatar letter={t.name[0]} colorClass={t.color} />
              <div className="min-w-0"><div className="text-sm font-semibold truncate">{t.name}</div><div className="text-xs text-muted truncate">{t.artist}</div></div>
            </li>
          ))}
        </ul>
      </SpotifyCard>

      {/* Recently Played */}
      <SpotifyCard>
        <div className="flex items-center justify-between mb-4">
          <div className="font-display font-semibold">Recently Played</div>
          <span className="chip text-[10px]"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>live</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEMO_RECENT.map(r => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border/40 p-2.5 hover:border-brand/30 transition-colors">
              <LetterAvatar letter={r.name[0]} colorClass={r.color} size="h-11 w-11" />
              <div className="min-w-0 flex-1"><div className="text-sm font-semibold truncate">{r.name}</div><div className="text-xs text-muted truncate">{r.artist}</div></div>
              <div className="text-[10px] text-muted/60 shrink-0">{r.ago}</div>
            </li>
          ))}
        </ul>
      </SpotifyCard>
    </div>
  );
}

/* ─── Authenticated dashboard content ────────────────────────────────── */

async function DashboardContent({ userId, searchParams }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  const sp = await loadSpotify(userId);

  return (
    <>
      {searchParams?.spotify === "connected" && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-6 flex items-center gap-3">
          <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          <span className="text-sm text-green-700">Spotify connected successfully!</span>
        </div>
      )}
      {searchParams?.spotify_error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
          <span className="text-sm text-red-600">Spotify error: {searchParams.spotify_error}</span>
        </div>
      )}

      {!sp.connected ? (
        <div className="card p-10 text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-50 grid place-items-center text-brand">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.8.8 0 01-1.1.3c-3-1.8-6.8-2.2-11.3-1.2a.8.8 0 11-.3-1.5c4.9-1.1 9.1-.6 12.4 1.3.4.2.5.7.3 1.1zm1.2-2.7a1 1 0 01-1.3.3c-3.5-2.1-8.7-2.7-12.8-1.5a1 1 0 01-.6-1.9c4.6-1.4 10.4-.7 14.4 1.7.5.3.6.9.3 1.4zm.1-2.8C14 8.6 7.6 8.4 3.8 9.5a1.2 1.2 0 11-.7-2.3C7.6 5.9 14.7 6.1 19.1 8.7a1.2 1.2 0 01-1.2 2.2z"/></svg>
          </div>
          <h2 className="font-display text-2xl font-bold mt-5">Connect Spotify</h2>
          <p className="text-muted text-sm mt-2 max-w-md mx-auto">Pull your top artists, top tracks, and recently played into your FansFest dashboard.</p>
          <Link href="/api/spotify/connect" className="btn-primary mt-6 px-6 py-3 text-base inline-flex">Connect Spotify</Link>
        </div>
      ) : sp.error ? (
        <div className="card p-6">
          <div className="text-sm text-red-600">Could not load Spotify data: {sp.error}</div>
          <Link href="/api/spotify/connect" className="btn-secondary mt-3 inline-flex">Reconnect</Link>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <div className="grid md:grid-cols-[1fr_auto] gap-4">
            <SpotifyCard className="flex items-center gap-4">
              {sp.me.images?.[0]?.url ? (
                <Image src={sp.me.images[0].url} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-2 ring-brand/20" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-brand grid place-items-center text-white font-bold text-xl">{sp.me.display_name?.[0]?.toUpperCase() || "?"}</div>
              )}
              <div>
                <div className="font-display font-bold text-lg">{sp.me.display_name}</div>
                <div className="text-xs text-muted flex items-center gap-2">
                  <span className="chip text-[10px] py-0.5 px-2 bg-[#1DB954]/10 border-[#1DB954]/20 text-[#1DB954]">Spotify</span>
                  {sp.me.followers?.total ?? 0} followers &middot; {sp.me.country}
                </div>
              </div>
            </SpotifyCard>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 text-center"><div className="text-xs text-muted font-medium">Top Artists</div><div className="font-display text-xl font-bold">{sp.topArtists.length}</div></div>
              <div className="card p-4 text-center"><div className="text-xs text-muted font-medium">Recent</div><div className="font-display text-xl font-bold">{sp.recent.length}</div></div>
            </div>
          </div>

          <SpotifyCard>
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-semibold">Top Artists</div>
              <span className="chip text-[10px]">short term</span>
            </div>
            {sp.topArtists.length === 0 ? (
              <div className="text-sm text-muted py-4 text-center">No listening history yet.</div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sp.topArtists.map(a => (
                  <li key={a.id} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border/40 p-2.5 hover:border-brand/30 transition-colors">
                    {a.images?.[0]?.url ? <Image src={a.images[0].url} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-lavender-100 grid place-items-center text-muted text-xs">?</div>}
                    <div className="min-w-0"><div className="text-sm font-semibold truncate">{a.name}</div><div className="text-xs text-muted truncate">{a.genres?.[0] || "Artist"}</div></div>
                  </li>
                ))}
              </ul>
            )}
          </SpotifyCard>

          <SpotifyCard>
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-semibold">Top Tracks</div>
              <span className="chip text-[10px]">short term</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sp.topTracks.map(t => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border/40 p-2.5 hover:border-brand/30 transition-colors">
                  {t.album?.images?.[0]?.url ? <Image src={t.album.images[0].url} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-lavender-100 grid place-items-center text-muted text-xs">?</div>}
                  <div className="min-w-0"><div className="text-sm font-semibold truncate">{t.name}</div><div className="text-xs text-muted truncate">{t.artists.map(a => a.name).join(", ")}</div></div>
                </li>
              ))}
            </ul>
          </SpotifyCard>

          {sp.recent.length > 0 && (
            <SpotifyCard>
              <div className="flex items-center justify-between mb-4">
                <div className="font-display font-semibold">Recently Played</div>
                <span className="chip text-[10px]"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>live</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sp.recent.map((r, i) => (
                  <li key={`${r.track.id}-${i}`} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border/40 p-2.5 hover:border-brand/30 transition-colors">
                    {r.track.album?.images?.[0]?.url ? <Image src={r.track.album.images[0].url} alt="" width={44} height={44} className="h-11 w-11 rounded-lg object-cover" /> : <div className="h-11 w-11 rounded-lg bg-lavender-100 grid place-items-center text-muted text-xs">?</div>}
                    <div className="min-w-0 flex-1"><div className="text-sm font-semibold truncate">{r.track.name}</div><div className="text-xs text-muted truncate">{r.track.artists.map(a => a.name).join(", ")}</div></div>
                    <div className="text-[10px] text-muted/60 shrink-0">{timeAgo(r.played_at)}</div>
                  </li>
                ))}
              </ul>
            </SpotifyCard>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default async function DashboardPage({ searchParams }) {
  const supabase = createClient();

  let user = null;
  let profile = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  if (user) {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      profile = data;
    } catch {
      profile = null;
    }
  }

  const isDemo = !user;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-sm text-muted">Welcome back</div>
            <h1 className="font-display text-3xl font-bold">
              {isDemo ? "Demo User" : (profile?.display_name || user.email)}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link href="/chat" className="btn-secondary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
              Chat
            </Link>
            <Link href="/api/spotify/connect" className="btn-primary">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.8.8 0 01-1.1.3c-3-1.8-6.8-2.2-11.3-1.2a.8.8 0 11-.3-1.5c4.9-1.1 9.1-.6 12.4 1.3.4.2.5.7.3 1.1zm1.2-2.7a1 1 0 01-1.3.3c-3.5-2.1-8.7-2.7-12.8-1.5a1 1 0 01-.6-1.9c4.6-1.4 10.4-.7 14.4 1.7.5.3.6.9.3 1.4z"/></svg>
              Connect Spotify
            </Link>
          </div>
        </div>

        {isDemo ? (
          <DemoDashboard />
        ) : (
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent userId={user.id} searchParams={searchParams} />
          </Suspense>
        )}
      </main>
      <Footer />
    </>
  );
}
