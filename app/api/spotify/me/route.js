import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getValidAccessToken, spotifyFetch } from "@/lib/spotify";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const tokens = await getValidAccessToken(service, user.id);
  if (!tokens) return NextResponse.json({ connected: false });

  try {
    const [me, topArtists, topTracks, recent] = await Promise.all([
      spotifyFetch("/me", tokens.access_token),
      spotifyFetch("/me/top/artists?limit=8&time_range=short_term", tokens.access_token),
      spotifyFetch("/me/top/tracks?limit=8&time_range=short_term", tokens.access_token),
      spotifyFetch("/me/player/recently-played?limit=6", tokens.access_token).catch(() => ({ items: [] })),
    ]);
    return NextResponse.json({
      connected: true,
      profile: {
        id: me.id,
        display_name: me.display_name,
        email: me.email,
        product: me.product,
        image: me.images?.[0]?.url || null,
        followers: me.followers?.total ?? 0,
        country: me.country,
      },
      topArtists: topArtists.items.map(a => ({
        id: a.id, name: a.name, image: a.images?.[0]?.url || null, genres: a.genres?.slice(0,2) || [],
      })),
      topTracks: topTracks.items.map(t => ({
        id: t.id, name: t.name, artists: t.artists.map(x => x.name).join(", "),
        image: t.album?.images?.[0]?.url || null,
      })),
      recent: recent.items.map(r => ({
        id: r.track.id, name: r.track.name, artists: r.track.artists.map(x => x.name).join(", "),
        image: r.track.album?.images?.[0]?.url || null, played_at: r.played_at,
      })),
    });
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message }, { status: 500 });
  }
}
