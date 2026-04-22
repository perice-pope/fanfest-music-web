# Deploying FanFest to Vercel

## 1. Push to GitHub
```bash
cd fanfest-music-web
git init
git add .
git commit -m "FanFest MVP"
git branch -M main
git remote add origin git@github.com:<you>/fanfest-music-web.git
git push -u origin main
```

## 2. Create Supabase project
- New project → copy **Project URL**, **anon** and **service_role** keys
- SQL Editor → paste `supabase/schema.sql` → Run
- Auth → URL Configuration:
  - Site URL: `https://<your-vercel-domain>`
  - Redirect URLs: add `https://<your-vercel-domain>/auth/callback`

## 3. Create Spotify app
- https://developer.spotify.com/dashboard → Create app
- Redirect URIs:
  - `http://localhost:3000/api/spotify/callback`
  - `https://<your-vercel-domain>/api/spotify/callback`
- Copy Client ID + Secret

## 4. Import into Vercel
- New Project → import the GitHub repo
- Framework: Next.js (auto-detected)
- Environment Variables (all of these in Production + Preview):
  - `NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - `SPOTIFY_REDIRECT_URI=https://<your-vercel-domain>/api/spotify/callback`
- Deploy

## 5. Smoke test
- Sign up → confirm email → land on `/dashboard`
- Click "Connect Spotify" → approve → redirected back to `/dashboard?spotify=connected`
- Open `/chat` in two browsers → messages appear in realtime
