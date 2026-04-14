import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { spotifyAuthUrl } from "@/lib/spotify";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));

  const state = crypto.randomBytes(16).toString("hex");
  cookies().set("sp_oauth_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });

  return NextResponse.redirect(spotifyAuthUrl(state));
}
