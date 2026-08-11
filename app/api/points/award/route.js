import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CLIENT_AWARDS, awardPoints, getXp } from "@/lib/points";

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { kind, metadata = {} } = body;

  // The client picks the kind; the server picks the value.
  const award = CLIENT_AWARDS[kind];
  if (!award) {
    return NextResponse.json({ error: `unknown award kind: ${kind}` }, { status: 400 });
  }

  try {
    const result = await awardPoints(user.id, {
      source: award.source,
      kind: award.label,
      points: award.points,
      dedupeKey: award.dedupe(metadata),
      metadata,
    });

    return NextResponse.json({
      awarded: result.awarded,
      points: result.points,
      xp: await getXp(user.id),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
