# FanFest (EJAE) — v4 Feature Spec

**Stack answer:** Yes, this is React. Specifically **Next.js 14 (App Router) + React 18, plain JavaScript (not TypeScript), Tailwind CSS, Supabase** for auth/database. Deployed on Vercel at `fanfest-web.vercel.app`.

**Guiding constraint:** this is a demo. Every choice below is the smallest thing that is *actually functional*, not a mock.

---

## Shared foundation

### Storage
One consolidated, idempotent SQL file — `supabase/schema.sql` — is run once in the Supabase SQL Editor. It contains the original v1 schema (which was never run — that's why `profiles` doesn't exist yet) plus two new tables:

| Table | Purpose |
|---|---|
| `points_events` | Append-only XP ledger. `unique(user_id, dedupe_key)` makes every award idempotent. |
| `event_checkins` | Who checked in to which event, and whether the email went out. |
| `xp_totals` (view) | `sum(points) group by user_id` — powers the XP display and leaderboard. |

**Why a ledger, not an `xp` integer:** dedupe keys are what stop double-awarding when the browser retries, the user opens two tabs, or Spotify returns the same play twice. It's one extra table and it removes a whole class of demo-breaking bugs.

**Points are written by the service role only.** There is no RLS insert policy for users, so the browser cannot forge XP. All awards go through server routes that decide the amount.

### Award API
`POST /api/points/award` — single chokepoint. Body `{ kind }`. The server looks `kind` up in a fixed table of allowed awards (`presence: 10`, `link_social: 150`, `trivia: 100`, …) and ignores any client-supplied amount.

---

## Feature 1 — Login button creates an account

**Already ~80% built:** Supabase email/password auth, `/login`, `/signup`, `/auth/callback`, and session middleware all exist. What's missing is that signup requires an email-confirmation round trip, and the landing page ignores who's logged in.

### Changes
1. **`POST /api/auth/signup`** — new route. Uses the service-role key to call `admin.createUser({ email_confirm: true })`, so a new account is live immediately with no confirmation email. The `/signup` page calls this, then signs in with the same credentials. One click, straight into the site.
2. **Seeded accounts** — `scripts/seed-users.mjs`, run once:
   - Perice Pope · perice09@gmail.com
   - Amanda Jones · amajones88@gmail.com *(this account already exists in Supabase — the script updates its password and name rather than failing)*
   Both get confirmed emails and a starting XP grant so the demo isn't a blank slate.
3. **Landing page becomes identity-aware** — `app/page.jsx` (a Server Component) reads the session and passes `user` + live XP down to `InteractiveLanding`. The hardcoded "Pierre / 1,500XP" becomes the real display name and the real ledger total. Logged out, it falls back to the current demo values, so the page never looks broken.

### Deliberately not built
Social login, password reset, email verification. All are real work and none of them are what the demo is showing.

---

## Feature 2 — Record interactions on social media and Spotify

### The honest answer to "is there a tool out there?"
**For Spotify: yes, and it's the official API — no third-party tool needed.** `GET /me/player/recently-played` returns the user's last 50 plays with timestamps. Poll it, match tracks against EJAE, award XP. The OAuth plumbing for this is *already in the repo* (`lib/spotify.js`, `/api/spotify/connect|callback|me`); it just was never wired to points or to the landing page.

**For Instagram and TikTok: no, not for what you're describing.** Neither platform exposes "did this user post with #EJAE" to a third party. Instagram's Graph API only reads *your own* Business account's media, and hashtag search is capped and requires App Review. TikTok's Display API needs approval and only returns the connected user's own videos. Aggregators (Phyllo, Modash, Sprout) exist but are all paid, and still require the fan to authorize. That's why the TODO already lists both as "pending app review" — that assessment was correct.

So: **Spotify is the real integration. Social is a manual claim.**

### Spotify — fully functional
1. The **Spotify card in "Link Apps"** stops opening a type-your-handle modal. Logged in, it links to `/api/spotify/connect` → real Spotify OAuth → back to the landing page connected. Logged out, it routes to `/login` first.
2. **`POST /api/spotify/scan`** — new route. Fetches recently-played, then for each play inserts a points event with `dedupe_key = spotify:play:<played_at>`. Unique constraint means re-scanning is free and never double-pays.
   - Any track: **+5 XP**
   - Track by EJAE: **+25 XP** (artist-name match)
3. The scan runs on page load and again on each 60-second tick (Feature 4), so points appear while you listen.
4. The card shows connected state, the most recent tracks pulled, and XP earned from streaming.

### Social — manual claim, clearly labeled
TikTok/Instagram keep the existing handle modal. Linking awards a one-time **+150 XP** through `/api/points/award` (`kind: link_social`, deduped per platform). The copy says what it is: link your handle, post with #EJAE, and the artist team credits it. No pretending an API is watching.

---

## Feature 3 — "You're all checked in" auto-reply email

Attached to the existing **"EJAE listening party + fan Q&A"** activity card, whose CTA is already "Check In Now".

**`POST /api/checkin`** — requires a logged-in user (this is what Feature 1 unlocks):
1. Upserts `event_checkins` for `(user_id, 'listening-party')`.
2. Awards **+500 XP**, deduped — checking in twice pays once.
3. Sends the auto-reply via **Resend** to the address on the account: subject *"You're all checked in ✓"*, branded HTML with the event details and their XP balance.
4. Records `email_sent_at`.

**Fallback:** if `RESEND_API_KEY` is unset, the check-in and XP still succeed and the API returns `emailed: false`. The demo never hard-fails on a missing key.

**Known limit to plan around:** on Resend's free tier without a verified domain, delivery is restricted to the account owner's address (perice09@gmail.com). Sending to Amanda or any other fan needs a domain verified in Resend — about 5 minutes of DNS if you own one.

---

## Feature 4 — Always-moving activity band + points every minute

The band of fan avatars under the hero (currently a manual horizontal scroll).

### Continuous motion
Swap `overflow-x-auto` for a CSS marquee: the member list is rendered twice back-to-back and the track is translated `-50%` over 60 seconds on an infinite loop, which reads as a seamless slow drift. **Pauses on hover** so you can actually look at someone, and respects `prefers-reduced-motion`. No JS timer, no scroll listener — a single CSS keyframe, so it costs nothing.

### Live points
- **Cosmetic:** every ~8 seconds one random member's XP badge bumps and flashes, so the band feels populated.
- **Real, for the logged-in user:** a 60-second heartbeat calls `/api/points/award` with `kind: presence`, worth **+10 XP**. The header XP counter animates up and a toast confirms it.
- **Anti-farm:** the dedupe key is the current UTC minute (`presence:2026-08-05T14:32`). Ten open tabs still earn ten XP per minute, not a hundred.
- **Honest presence:** the timer only runs while the tab is visible (`visibilitychange`), so a backgrounded tab stops earning.

---

## Setup required from you

| Step | Where | Why |
|---|---|---|
| Run `supabase/schema.sql` | Supabase → SQL Editor | Creates every table. Never been run — nothing works without it. |
| `node scripts/seed-users.mjs` | Local terminal | Creates the Perice + Amanda accounts. |
| Add `RESEND_API_KEY` | `.env.local` + Vercel | Turns on the check-in email (Feature 3). |
| Add Spotify redirect URI | Spotify Dashboard | `https://fanfest-web.vercel.app/api/spotify/callback` |
| Fix `SPOTIFY_REDIRECT_URI` | `.env.local` | Currently `https://localhost:3000/...` — the `https` is wrong for local dev. |
| Copy env vars to Vercel | Vercel → Settings | Prod currently has no Supabase keys wired for the new routes. |
