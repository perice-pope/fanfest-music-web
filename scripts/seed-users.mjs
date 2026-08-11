#!/usr/bin/env node
/**
 * Seeds the demo accounts.
 *
 *   node scripts/seed-users.mjs
 *
 * Idempotent: an account that already exists has its password, display name,
 * and confirmed status updated rather than erroring out. Run it as often as
 * you like.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local, and the tables from supabase/schema.sql to already exist.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Minimal .env.local reader so this runs without extra dependencies.
function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, "");
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  } catch {
    // Fall back to whatever is already in the environment.
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const SEED_USERS = [
  {
    email: "perice09@gmail.com",
    password: "AugustCarter26",
    displayName: "Perice Pope",
    startingXp: 1500,
  },
  {
    email: "amajones88@gmail.com",
    password: "TestPassword135",
    displayName: "Amanda Jones",
    startingXp: 1200,
  },
];

async function findUserByEmail(email) {
  // listUsers is paginated; these demo projects are small enough to scan.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function seed({ email, password, displayName, startingXp }) {
  const existing = await findUserByEmail(email);
  let userId;

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { ...existing.user_metadata, display_name: displayName },
    });
    if (error) throw error;
    userId = existing.id;
    console.log(`  updated  ${email}  (${displayName})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  created  ${email}  (${displayName})`);
  }

  // The trigger in schema.sql handles new signups; this covers accounts that
  // predate it.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, display_name: displayName }, { onConflict: "id" });
  if (profileError) {
    console.warn(`  ! profile upsert failed: ${profileError.message}`);
    console.warn("    Have you run supabase/schema.sql yet?");
  }

  // Deduped, so re-running never inflates the balance.
  const { error: xpError } = await supabase.from("points_events").insert({
    user_id: userId,
    source: "seed",
    kind: "Founding member bonus",
    points: startingXp,
    dedupe_key: "seed:starting-balance",
  });
  if (xpError && xpError.code !== "23505") {
    console.warn(`  ! starting XP failed: ${xpError.message}`);
  } else if (!xpError) {
    console.log(`           +${startingXp} XP starting balance`);
  }
}

console.log("Seeding FanFest demo accounts…\n");

let failed = false;
for (const user of SEED_USERS) {
  try {
    await seed(user);
  } catch (e) {
    failed = true;
    console.error(`  FAILED   ${user.email}: ${e.message}`);
  }
}

console.log(failed ? "\nDone, with errors." : "\nDone.");
process.exit(failed ? 1 : 0);
