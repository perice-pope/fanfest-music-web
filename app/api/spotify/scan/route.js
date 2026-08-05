import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getValidAccessToken, spotifyFetch } from "@/lib/spotify";
import { awardMany, getXp } from "@/lib/points";

// Points per play. An EJAE track is the whole point of the fan club, so it's
// worth considerably more than background listening.
const POINTS_PER_PLAY = 5;
const POINTS_PER_ARTIST_PLAY = 25;

// Who counts as "the artist". Matched case-insensitively against every artist
// credited on the track, so features and remixes count too.
const ARTIST_MATCHERS = ["ejae"];

function isArtistTrack(track) {
  const names = (track.artists || []).map((a) => a.name.toLowerCase());
  return names.some((name) => ARTIST_MATCHERS.some((m) => name.includes(m)));
}

/**
 * Pulls the user's recent Spotify plays and turns each one into a points event.
 *
 * Safe to call as often as you like: the dedupe key is the play's `played_at`
 * timestamp, which Spotify guarantees is unique per play, so rescanning the
 * same 50 plays awards nothing the second time.
 */
export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();

  let tokens;
  try {
    tokens = await getValidAccessToken(service, user.id);
  } catch (e) {
    return NextResponse.json({ connected: false, error: e.message }, { status: 200 });
  }
  if (!tokens) return NextResponse.json({ connected: false, xp: await getXp(user.id) });

  let recent;
  try {
    recent = await spotifyFetch("/me/player/recently-played?limit=50", tokens.access_token);
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message, xp: await getXp(user.id) });
  }

  const plays = (recent.items || []).map((item) => ({
    name: item.track.name,
    artists: item.track.artists.map((a) => a.name).join(", "),
    image: item.track.album?.images?.[0]?.url || null,
    playedAt: item.played_at,
    isArtist: isArtistTrack(item.track),
  }));

  const events = plays.map((play) => ({
    source: "spotify",
    kind: play.isArtist ? `Streamed ${play.name}` : "Streamed on Spotify",
    points: play.isArtist ? POINTS_PER_ARTIST_PLAY : POINTS_PER_PLAY,
    // played_at is unique per play — the natural idempotency key.
    dedupeKey: `spotify:play:${play.playedAt}`,
    metadata: { track: play.name, artists: play.artists, artistTrack: play.isArtist },
  }));

  let result = { awarded: 0, points: 0 };
  try {
    result = await awardMany(user.id, events);
  } catch (e) {
    return NextResponse.json({ connected: true, error: e.message, xp: await getXp(user.id) });
  }

  return NextResponse.json({
    connected: true,
    scanned: plays.length,
    newPlays: result.awarded,
    pointsEarned: result.points,
    artistPlays: plays.filter((p) => p.isArtist).length,
    // Newest few, for the widget.
    recent: plays.slice(0, 5),
    xp: await getXp(user.id),
  });
}
