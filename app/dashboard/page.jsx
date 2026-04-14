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
        <AdminDashboard userName={displayName} />
      </main>
      <Footer />
    </>
  );
}
