# FansFest Web

Production-shaped MVP for FansFest: landing page, auth, Spotify connect, Supabase-backed realtime chat, and a profile/settings shell — all in a single Next.js (App Router) codebase.

## Stack

- **Next.js 14** (App Router, JS)
- **React 18**
- **Tailwind CSS** (custom dark theme)
- **Supabase** — Auth + Postgres + Realtime
- **Spotify Web API** via server-side OAuth (Authorization Code)
- **Vercel**-ready

## Quick start

```bash
# 1) Install deps
npm install

# 2) Set up env
cp .env.example .env.local
# fill in values (see Env section below)

# 3) Run the database schema
#    Open your Supabase project → SQL Editor → paste supabase/schema.sql → Run

# 4) Run the dev server
npm run dev
# http://localhost:3000
```

## Env

See `.env.example`. Required keys:

| Var | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in dev, your Vercel URL in prod |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API (keep secret — server-only) |
| `SPOTIFY_CLIENT_ID` | https://developer.spotify.com/dashboard |
| `SPOTIFY_CLIENT_SECRET` | Same dashboard |
| `SPOTIFY_REDIRECT_URI` | `http://localhost:3000/api/spotify/callback` (add prod one too) |

## Routes

| Route | Description |
| --- | --- |
| `/` | Public landing (hero, chat teaser, social link buttons) |
| `/login`, `/signup` | Email + password auth |
| `/auth/callback` | Supabase magic-link / email-confirm exchange |
| `/auth/signout` | POST → signs out |
| `/dashboard` | Protected: Spotify connect CTA + top artists/tracks |
| `/chat` | Protected: realtime default-room chat |
| `/profile` | Protected: display name, avatar, Spotify status |
| `/api/spotify/connect` | Start Spotify OAuth (server) |
| `/api/spotify/callback` | Finish Spotify OAuth, write tokens server-side |
| `/api/spotify/me` | Server-proxied Spotify data (auto-refreshes tokens) |

## Database

Run `supabase/schema.sql` in the Supabase SQL Editor. It creates:

- `profiles` (1:1 with `auth.users`, auto-created by trigger)
- `spotify_accounts` (server-only writes via service role)
- `chat_rooms` (seeds a default **The Lounge**)
- `chat_members`
- `chat_messages` (added to `supabase_realtime` publication)

RLS is enabled everywhere. Token columns on `spotify_accounts` are never written by clients — only by our server routes using the service role key.

## Spotify setup

1. Create an app at https://developer.spotify.com/dashboard
2. Add redirect URIs: `http://localhost:3000/api/spotify/callback` and your prod URL equivalent
3. Copy client ID + secret into `.env.local`
4. During development, Spotify apps are in "Development Mode" — only listed test users (up to 25) can sign in. Submit for extended quota (free, ~2 week review) when ready.

Scopes used: `user-read-email user-read-private user-top-read user-read-recently-played`.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel → framework auto-detected as Next.js.
3. Add env vars from `.env.example` in Vercel Project Settings → Environment Variables.
4. After first deploy, set `NEXT_PUBLIC_SITE_URL` to the production URL and add the prod `SPOTIFY_REDIRECT_URI` in the Spotify dashboard.
5. In Supabase Auth settings, add the prod URL to "Site URL" and "Redirect URLs".

## Assumptions & shortcuts

- Email/password auth only; magic link & OAuth providers can be added via Supabase without schema changes.
- One default chat room (`The Lounge`) — multi-room is a small extension.
- Spotify tokens auto-refresh on demand in `/api/spotify/me` and server components; we don't prefetch or cron-refresh.
- Dashboard fetches Spotify data per request (`dynamic = force-dynamic`). Swap to `revalidate = 60` + a tagged cache once usage grows.
- Profile avatars are URLs for now (no upload/storage bucket).

## Next steps

- Instagram (Graph API) + TikTok Login Kit — both require app review; queue those in parallel with Spotify.
- Multi-room chat with invite-based membership.
- Avatar upload via Supabase Storage.
- Push notifications for new drops.
- Caching layer for Spotify top data (per-user keyed).

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # serve built app
```
