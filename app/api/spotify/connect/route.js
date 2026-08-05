import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { spotifyAuthUrl } from "@/lib/spotify";

export async function GET(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirects are derived from the incoming request rather than
  // NEXT_PUBLIC_SITE_URL, so this works on preview deploys and localhost
  // without extra config.
  if (!user) return NextResponse.redirect(new URL("/login?next=/", request.url));

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REDIRECT_URI) {
    return NextResponse.redirect(new URL("/?spotify_error=not_configured", request.url));
  }

  const state = crypto.randomBytes(16).toString("hex");
  cookies().set("sp_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(spotifyAuthUrl(state));
}
