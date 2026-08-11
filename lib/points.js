// Server-side XP ledger. Never import from a client component — it needs the
// service-role key.
//
// Design rule: the browser never says how many points something is worth. It
// sends a `kind`, the server looks the value up here. Combined with the
// (user_id, dedupe_key) unique index, that makes every award both
// unforgeable and idempotent.

import { createServiceClient } from "@/lib/supabase/server";

// The complete set of awards a client is allowed to trigger directly.
// Spotify plays and check-ins are awarded by their own routes, which compute
// their own dedupe keys, so they are deliberately absent from this table.
export const CLIENT_AWARDS = {
  presence: {
    points: 10,
    source: "presence",
    label: "Active on FanFest",
    // One award per wall-clock minute, regardless of how many tabs are open.
    dedupe: () => `presence:${new Date().toISOString().slice(0, 16)}`,
  },
  link_social: {
    points: 150,
    source: "social",
    label: "Linked a social account",
    // One award per platform, ever.
    dedupe: (meta) => `link_social:${meta.platform}`,
  },
  trivia: {
    points: 100,
    source: "trivia",
    label: "Answered trivia correctly",
    dedupe: (meta) => `trivia:${meta.questionId || "default"}`,
  },
  invite: {
    points: 200,
    source: "social",
    label: "Invited a friend",
    dedupe: () => `invite:${new Date().toISOString().slice(0, 10)}`,
  },
};

/**
 * Write a points event. Returns { awarded, points } — `awarded` is false when
 * the dedupe key already existed, which is a normal outcome, not an error.
 */
export async function awardPoints(userId, { source, kind, points, dedupeKey, metadata = {} }) {
  const service = createServiceClient();

  const { data, error } = await service
    .from("points_events")
    .insert({ user_id: userId, source, kind, points, dedupe_key: dedupeKey, metadata })
    .select("id")
    .maybeSingle();

  // 23505 = unique violation = we already paid for this. Expected on retries.
  if (error) {
    if (error.code === "23505") return { awarded: false, points: 0 };
    throw error;
  }

  return { awarded: Boolean(data), points };
}

/** Award several events at once, skipping any that were already paid. */
export async function awardMany(userId, events) {
  let total = 0;
  let count = 0;
  for (const event of events) {
    const result = await awardPoints(userId, event);
    if (result.awarded) {
      total += result.points;
      count += 1;
    }
  }
  return { awarded: count, points: total };
}

/**
 * Current XP total for a user.
 *
 * Never throws: a missing service-role key or an unapplied schema returns 0
 * rather than taking down the page that asked. The landing page renders for
 * everyone or it renders for no one, and 0 XP is the better failure.
 */
export async function getXp(userId) {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("points_events")
      .select("points")
      .eq("user_id", userId);

    if (error) {
      console.error("[points] getXp failed:", error.message);
      return 0;
    }
    return data.reduce((sum, row) => sum + row.points, 0);
  } catch (e) {
    console.error("[points] getXp unavailable:", e.message);
    return 0;
  }
}

/** Most recent awards, for the "how you earned it" feed. */
export async function getRecentEvents(userId, limit = 10) {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("points_events")
      .select("kind, points, source, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data;
  } catch {
    return [];
  }
}
