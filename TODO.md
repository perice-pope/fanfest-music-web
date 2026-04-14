# FansFest TODO

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

## Next (post-launch)
- [ ] Deploy to Vercel + custom domain
- [ ] Run `supabase/schema.sql` and `supabase/storage.sql` in Supabase SQL Editor
- [ ] Spotify redirect URI: update to production URL after deploy
- [ ] Instagram Graph API connection (pending app review)
- [ ] TikTok Login Kit (pending app review)
- [ ] Email magic-link fallback
- [ ] Rate limits on chat message insert
- [ ] E2E test with Playwright for happy path
- [ ] Real-time leaderboard with Supabase
- [ ] Push notifications for chat messages
