# FanFest TODO

## Shipped (MVP day 1)
- [x] Landing page (hero, chat preview, social link buttons)
- [x] Email/password auth (signup, login, signout, email confirm callback)
- [x] Supabase middleware protecting `/dashboard`, `/chat`, `/profile`
- [x] SQL schema with RLS + realtime publication
- [x] Spotify OAuth (server-side, state-protected)
- [x] Spotify token refresh helper
- [x] Dashboard pulling `/me`, `/me/top/artists`, `/me/top/tracks`
- [x] Realtime chat (default room, optimistic send, profile hydration)
- [x] Profile/settings form (display name + avatar URL)

## Shipped (v2 — design + features)
- [x] Avatar upload via Supabase Storage (drag/click, preview, validation)
- [x] Supabase Storage schema for avatars bucket with RLS policies
- [x] Spotify recently-played widget on dashboard
- [x] Loading skeletons on dashboard (Suspense-wrapped)
- [x] Redesigned chat UI (timestamps, member count, send icon, empty state)
- [x] Profile page with avatar upload, Spotify status, social placeholders
- [x] Auth pages with split-screen artist imagery

## Shipped (v3 — Figma match + interactive demo)
- [x] Full redesign matching Figma (lavender/purple #7C3AED theme, light bg)
- [x] Landing page matching Figma layout: sub-nav tabs, how it works, hero/profile with XP stats, activity members, fans leaderboard, interact to unlock rewards, rewards, link apps
- [x] Interactive landing page: trivia with answer feedback + XP animation, tab switching, "How it works" carousel, toast notifications, reward claim buttons, invite link copy
- [x] Mobile responsive (375px / 768px / 1280px breakpoints)
- [x] Admin Management Console dashboard (filters sidebar, summary cards, fan behavior donut chart, user info table with 36 users + pagination)
- [x] Chat rooms slide-out drawer (4 rooms, unique conversations, auto-reply, floating FAB button, persists globally)
- [x] Demo mode on all pages (no auth required — browsable without login)
- [x] TikTok + Instagram social links (tiktok.com/@ejaemusic, instagram.com/ejaemusic)
- [x] ChatProvider context for global chat access

## Shipped (v4 — accounts, tracking, check-in email, live band)
See `SPEC-v4.md` for the full spec.
- [x] `supabase/schema.sql` rewritten as one idempotent file and **applied** to the live project
- [x] `points_events` XP ledger with `(user_id, dedupe_key)` unique index — every award is idempotent
- [x] `event_checkins` table + `xp_totals` view
- [x] `/api/auth/signup` — service-role `createUser({ email_confirm: true })`, so signup is one click with no confirmation email
- [x] Seeded accounts via `scripts/seed-users.mjs` (Perice 1500XP, Amanda 1200XP)
- [x] Landing page is identity-aware — real display name and real XP when signed in
- [x] `/api/points/award` — server-side award table; the client can't set its own point values
- [x] `/api/spotify/scan` — recently-played → points, deduped on `played_at` (+5/play, +25 for an EJAE track)
- [x] Spotify card does real OAuth instead of asking for a handle; shows live track list
- [x] `/api/checkin` — listening party check-in, +500XP, sends "You're all checked in" via Resend
- [x] Email degrades gracefully: no `RESEND_API_KEY` → check-in and XP still succeed
- [x] Activity band is a CSS marquee — always drifting, pauses on hover, respects `prefers-reduced-motion`
- [x] +10XP presence award every 60s while the tab is visible, deduped per UTC minute
- [x] Fixed the `fansfest-web` → `fanfest-web` typo in the Vercel `NEXT_PUBLIC_SITE_URL` / `SPOTIFY_REDIRECT_URI`

## Next (post-launch)
- [ ] Add `RESEND_API_KEY` to `.env.local` + Vercel to switch the check-in email on
- [ ] Verify a domain in Resend so check-in email reaches fans other than the account owner
- [ ] Add `https://fanfest-web.vercel.app/api/spotify/callback` to the Spotify app's redirect URIs
- [ ] Custom domain
- [ ] Run `supabase/storage.sql` in Supabase SQL Editor (avatars bucket)
- [ ] Real leaderboard reading from `xp_totals` (currently still the Figma sample data)
- [ ] Instagram Graph API connection (pending app review)
- [ ] TikTok Login Kit (pending app review)
- [ ] Email magic-link fallback
- [ ] Rate limits on chat message insert
- [ ] E2E test with Playwright for happy path
- [ ] Real-time leaderboard with Supabase
- [ ] Push notifications for chat messages
