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

## Next
- [ ] Avatar upload via Supabase Storage
- [ ] Multi-room chat (invites, member list, unread counts)
- [ ] Spotify recently-played widget on dashboard
- [ ] Instagram Graph API connection (pending app review)
- [ ] TikTok Login Kit (pending app review)
- [ ] Email magic-link fallback
- [ ] Rate limits on chat message insert
- [ ] Better loading skeletons on dashboard
- [ ] E2E test with Playwright for happy path
- [ ] Management Console (Figma ref: https://www.figma.com/design/MmFA3xHZnpgoy7TFGlUsWj/Management-Console-Wireframe?node-id=0-1&p=f&t=PSC7hOQRJyP0QJH7-0)
