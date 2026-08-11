import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveLanding from "@/components/InteractiveLanding";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getXp } from "@/lib/points";

// XP shown to signed-out visitors so the demo still looks alive.
const DEMO_XP = 1500;

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let fan = null;

  if (user) {
    // Which events they've already checked in to, so the card renders in the
    // right state on first paint instead of flickering.
    let checkedInEvents = [];
    try {
      const service = createServiceClient();
      const { data } = await service
        .from("event_checkins")
        .select("event_slug")
        .eq("user_id", user.id);
      checkedInEvents = (data || []).map((row) => row.event_slug);
    } catch {
      // Schema not applied yet — fall through with an empty list.
    }

    fan = {
      id: user.id,
      email: user.email,
      displayName:
        user.user_metadata?.display_name || user.email?.split("@")[0] || "Fan",
      xp: await getXp(user.id),
      checkedInEvents,
    };
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Suspense boundary: InteractiveLanding reads useSearchParams() to pick
            up the ?spotify=connected redirect. */}
        <Suspense>
          <InteractiveLanding fan={fan} demoXp={DEMO_XP} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
