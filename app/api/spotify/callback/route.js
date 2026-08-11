import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, spotifyFetch } from "@/lib/spotify";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) return NextResponse.redirect(`${origin}/?spotify_error=${encodeURIComponent(error)}`);

  const expected = cookies().get("sp_oauth_state")?.value;
  if (!code || !state || state !== expected) {
    return NextResponse.redirect(`${origin}/?spotify_error=state_mismatch`);
  }
  cookies().delete("sp_oauth_state");

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  try {
    const tokens = await exchangeCodeForTokens(code);
    const me = await spotifyFetch("/me", tokens.access_token);

    const service = createServiceClient();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await service.from("spotify_accounts").upsert({
      user_id: user.id,
      spotify_id: me.id,
      display_name: me.display_name,
      avatar_url: me.images?.[0]?.url || null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return NextResponse.redirect(`${origin}/?spotify=connected`);
  } catch (e) {
    return NextResponse.redirect(`${origin}/?spotify_error=${encodeURIComponent(e.message)}`);
  }
}
