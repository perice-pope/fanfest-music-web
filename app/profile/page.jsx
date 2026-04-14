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
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold">Profile & settings</h1>
        <p className="text-muted text-sm mt-1">Manage how you appear in FansFest.</p>

        <div className="mt-8 grid gap-4">
          <div className="card p-6">
            <div className="font-display font-semibold mb-4">Account</div>
            <ProfileForm initialProfile={profile} email={user.email} />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-semibold">Spotify</div>
                {spotify ? (
                  <div className="text-sm text-muted mt-1">
                    Connected as <span className="text-text">{spotify.display_name}</span> · since {new Date(spotify.connected_at).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-sm text-muted mt-1">Not connected yet.</div>
                )}
              </div>
              <Link href="/api/spotify/connect" className={spotify ? "btn-secondary" : "btn-primary"}>
                {spotify ? "Reconnect" : "Connect Spotify"}
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <div className="font-display font-semibold mb-1">Social (coming soon)</div>
            <div className="text-sm text-muted">Instagram, TikTok, and X integrations are queued behind their platform reviews.</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
