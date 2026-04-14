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
- [x] Full redesign matching Figma dark theme (pink/magenta brand, pure black bg)
- [x] Landing page with artist hero (EJAE imagery), value props, artist gallery, CTA
- [x] Auth pages with split-screen artist imagery
- [x] Avatar upload via Supabase Storage (drag/click, preview, validation)
- [x] Supabase Storage schema for avatars bucket with RLS policies
- [x] Spotify recently-played widget on dashboard
- [x] Loading skeletons on dashboard (Suspense-wrapped)
- [x] Redesigned chat UI (timestamps, member count, send icon, empty state)
- [x] Profile page with avatar upload, Spotify status, social placeholders

## Next
- [ ] Multi-room chat (invites, member list, unread counts)
- [ ] Instagram Graph API connection (pending app review)
- [ ] TikTok Login Kit (pending app review)
- [ ] Email magic-link fallback
- [ ] Rate limits on chat message insert
- [ ] E2E test with Playwright for happy path
- [ ] Management Console (Figma ref: https://www.figma.com/design/MmFA3xHZnpgoy7TFGlUsWj/Management-Console-Wireframe?node-id=0-1&p=f&t=PSC7hOQRJyP0QJH7-0)
