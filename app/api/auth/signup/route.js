import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/points";

// Creates a confirmed account in one shot. Supabase's normal signUp() sends a
// confirmation email and hands back no session until the link is clicked —
// too much friction for a demo. Using the service role with
// email_confirm: true lets the /signup page create the account and sign the
// user straight in.
export async function POST(request) {
  const { email, password, displayName } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const service = createServiceClient();

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName || email.split("@")[0] },
  });

  if (error) {
    // Supabase phrases this as "already been registered" — point them at login.
    const alreadyExists = /already/i.test(error.message);
    return NextResponse.json(
      {
        error: alreadyExists
          ? "That email already has an account. Try signing in instead."
          : error.message,
        alreadyExists,
      },
      { status: alreadyExists ? 409 : 400 }
    );
  }

  // Welcome grant so a brand-new account doesn't land on a zeroed-out page.
  await awardPoints(data.user.id, {
    source: "seed",
    kind: "Welcome to FanFest",
    points: 100,
    dedupeKey: "welcome",
  }).catch(() => {});

  return NextResponse.json({ ok: true, userId: data.user.id });
}
