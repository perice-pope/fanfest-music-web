import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: spotify } = await supabase.from("spotify_accounts")
    .select("spotify_id, display_name, avatar_url, connected_at").eq("user_id", user.id).maybeSingle();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted text-sm mt-1">Manage how you appear in FansFest.</p>

        <div className="mt-8 grid gap-4">
          <div className="card p-6">
            <div className="font-display font-semibold mb-5 flex items-center gap-2 text-brand">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
              Account
            </div>
            <ProfileForm initialProfile={profile} email={user.email} userId={user.id} />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${spotify ? "bg-[#1DB954]/10 text-[#1DB954]" : "bg-surface2 text-muted"}`}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.8.8 0 01-1.1.3c-3-1.8-6.8-2.2-11.3-1.2a.8.8 0 11-.3-1.5c4.9-1.1 9.1-.6 12.4 1.3.4.2.5.7.3 1.1zm1.2-2.7a1 1 0 01-1.3.3c-3.5-2.1-8.7-2.7-12.8-1.5a1 1 0 01-.6-1.9c4.6-1.4 10.4-.7 14.4 1.7.5.3.6.9.3 1.4z"/></svg>
                </div>
                <div>
                  <div className="font-display font-semibold">Spotify</div>
                  {spotify ? (
                    <div className="text-sm text-muted mt-0.5">Connected as <span className="text-text font-medium">{spotify.display_name}</span> &middot; since {new Date(spotify.connected_at).toLocaleDateString()}</div>
                  ) : (
                    <div className="text-sm text-muted mt-0.5">Not connected yet.</div>
                  )}
                </div>
              </div>
              <Link href="/api/spotify/connect" className={spotify ? "btn-secondary" : "btn-primary"}>{spotify ? "Reconnect" : "Connect"}</Link>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-surface2 grid place-items-center text-muted">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
              </div>
              <div>
                <div className="font-display font-semibold">Social Connections</div>
                <div className="text-sm text-muted mt-0.5">Instagram, TikTok, and X integrations are in platform review.</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="chip opacity-60">Instagram</span>
              <span className="chip opacity-60">TikTok</span>
              <span className="chip opacity-60">X</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
