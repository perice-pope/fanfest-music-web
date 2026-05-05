import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminDashboard from "@/components/AdminDashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  let user = null;
  let profile = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  if (user) {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      profile = data;
    } catch {
      profile = null;
    }
  }

  const displayName = profile?.display_name || user?.email || "Admin";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8">
        {/* Back arrow → returns to the main fan page */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-5 font-display font-semibold text-sm text-mauve hover:text-mauve-700 transition group"
        >
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-mauve/30 group-hover:bg-mauve group-hover:text-white group-hover:border-mauve transition">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </span>
          <span>Admin</span>
        </Link>
        <AdminDashboard userName={displayName} />
      </main>
      <Footer />
    </>
  );
}
