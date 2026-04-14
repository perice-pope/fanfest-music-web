import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getValidAccessToken, spotifyFetch } from "@/lib/spotify";

export const dynamic = "force-dynamic";

async function loadSpotify(userId) {
  try {
    const service = createServiceClient();
    const tokens = await getValidAccessToken(service, userId);
    if (!tokens) return { connected: false };
    const [me, topArtists, topTracks] = await Promise.all([
      spotifyFetch("/me", tokens.access_token),
      spotifyFetch("/me/top/artists?limit=6&time_range=short_term", tokens.access_token),
      spotifyFetch("/me/top/tracks?limit=6&time_range=short_term", tokens.access_token),
    ]);
    return { connected: true, me, topArtists: topArtists.items, topTracks: topTracks.items };
  } catch (e) {
    return { connected: true, error: e.message };
  }
}

export default async function DashboardPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const sp = await loadSpotify(user.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="text-sm text-muted">Welcome back</div>
            <h1 className="font-display text-3xl font-semibold">
              {profile?.display_name || user.email}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link href="/chat" className="btn-secondary">Open chat</Link>
            {!sp.connected ? (
              <Link href="/api/spotify/connect" className="btn-primary">Connect Spotify</Link>
            ) : (
              <Link href="/api/spotify/connect" className="btn-secondary">Reconnect Spotify</Link>
            )}
          </div>
        </div>

        {searchParams?.spotify === "connected" && (
          <div className="card p-4 mb-6 border-brand/40">
            <div className="text-sm">🎧 Spotify connected successfully.</div>
          </div>
        )}
        {searchParams?.spotify_error && (
          <div className="card p-4 mb-6 border-red-500/40">
            <div className="text-sm text-red-400">Spotify error: {searchParams.spotify_error}</div>
          </div>
        )}

        {!sp.connected ? (
          <div className="card p-8 text-center">
            <div className="h-12 w-12 mx-auto rounded-xl bg-brand/15 text-brand grid place-items-center font-black">♪</div>
            <h2 className="font-display text-xl font-semibold mt-4">Connect Spotify</h2>
            <p className="text-muted text-sm mt-1 max-w-md mx-auto">
              Pull your top artists, top tracks and listening activity into your FansFest profile.
            </p>
            <Link href="/api/spotify/connect" className="btn-primary mt-5 inline-flex">Connect Spotify</Link>
          </div>
        ) : sp.error ? (
          <div className="card p-6">
            <div className="text-sm text-red-400">Couldn't load Spotify data: {sp.error}</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-4">
                {sp.me.images?.[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sp.me.images[0].url} alt="" className="h-14 w-14 rounded-full object-cover" />
                )}
                <div>
                  <div className="text-sm text-muted">Spotify</div>
                  <div className="font-display font-semibold text-lg">{sp.me.display_name}</div>
                  <div className="text-xs text-muted">{sp.me.followers?.total ?? 0} followers · {sp.me.country}</div>
                </div>
              </div>
            </div>

            <div className="card p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-semibold">Top artists</div>
                <span className="chip">short term</span>
              </div>
              {sp.topArtists.length === 0 ? (
                <div className="text-sm text-muted">No listening history yet.</div>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sp.topArtists.map(a => (
                    <li key={a.id} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border p-2.5">
                      {a.images?.[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.images[0].url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{a.name}</div>
                        <div className="text-xs text-muted truncate">{a.genres?.[0] || "—"}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card p-5 md:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-semibold">Top tracks</div>
                <span className="chip">short term</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sp.topTracks.map(t => (
                  <li key={t.id} className="flex items-center gap-3 rounded-xl bg-surface2 border border-border p-2.5">
                    {t.album?.images?.[0]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.album.images[0].url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-xs text-muted truncate">{t.artists.map(a => a.name).join(", ")}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
