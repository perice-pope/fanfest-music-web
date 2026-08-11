import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getXp, getRecentEvents } from "@/lib/points";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ signedIn: false, xp: 0, recent: [] });

  return NextResponse.json({
    signedIn: true,
    xp: await getXp(user.id),
    recent: await getRecentEvents(user.id),
  });
}
