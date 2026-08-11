import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { awardPoints, getXp } from "@/lib/points";
import { sendEmail, checkInEmail } from "@/lib/email";

const CHECKIN_POINTS = 500;

// Events you can check in to. Kept server-side so the client can't invent one.
const EVENTS = {
  "listening-party": {
    name: "EJAE listening party + fan Q&A",
    detail: "Friday 8:00 PM ET · Live on FanFest",
  },
};

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to check in to the listening party." },
      { status: 401 }
    );
  }

  const { eventSlug = "listening-party" } = await request.json().catch(() => ({}));
  const event = EVENTS[eventSlug];
  if (!event) return NextResponse.json({ error: "unknown event" }, { status: 400 });

  const service = createServiceClient();

  // Did they already check in? Determines whether we re-send the email.
  const { data: existing } = await service
    .from("event_checkins")
    .select("checked_in_at, email_sent_at")
    .eq("user_id", user.id)
    .eq("event_slug", eventSlug)
    .maybeSingle();

  await service.from("event_checkins").upsert(
    { user_id: user.id, event_slug: eventSlug },
    { onConflict: "user_id,event_slug", ignoreDuplicates: true }
  );

  // Deduped — checking in twice pays once.
  const award = await awardPoints(user.id, {
    source: "checkin",
    kind: `Checked in: ${event.name}`,
    points: CHECKIN_POINTS,
    dedupeKey: `checkin:${eventSlug}`,
    metadata: { eventSlug },
  }).catch((e) => {
    console.error("[checkin] award failed:", e.message);
    return { awarded: false, points: 0 };
  });

  const xp = await getXp(user.id);

  // Only auto-reply on the first check-in.
  let emailed = false;
  let emailError = null;

  if (!existing?.email_sent_at) {
    const displayName =
      user.user_metadata?.display_name || user.email?.split("@")[0] || "there";

    const { subject, html } = checkInEmail({
      displayName,
      eventName: event.name,
      eventDetail: event.detail,
      xp,
    });

    const result = await sendEmail({ to: user.email, subject, html });
    emailed = result.sent;
    emailError = result.error || null;

    await service
      .from("event_checkins")
      .update({
        email_sent_at: result.sent ? new Date().toISOString() : null,
        email_error: result.error || null,
      })
      .eq("user_id", user.id)
      .eq("event_slug", eventSlug);
  }

  return NextResponse.json({
    ok: true,
    alreadyCheckedIn: Boolean(existing),
    pointsAwarded: award.awarded ? award.points : 0,
    xp,
    email: user.email,
    emailed,
    emailError,
  });
}

// Lets the page render the card as already-checked-in on load.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ checkins: [] });

  const service = createServiceClient();
  const { data } = await service
    .from("event_checkins")
    .select("event_slug, checked_in_at, email_sent_at")
    .eq("user_id", user.id);

  return NextResponse.json({ checkins: data || [] });
}
