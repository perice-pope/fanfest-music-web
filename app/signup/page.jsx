"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMsg("Check your email for a confirmation link.");
    }
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Left — image */}
      <div className="hidden md:block relative bg-gradient-brand">
        <Image
          src="/images/artist/ejae-time-after-time.jpg"
          alt="EJAE - Time After Time"
          fill
          className="object-cover mix-blend-multiply opacity-60"
          priority
        />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-card-lg max-w-sm">
            <p className="text-sm italic text-muted">&ldquo;The community here is different. Real fans, real conversations.&rdquo;</p>
            <p className="text-sm font-semibold mt-2 text-brand">Maya, FansFest Member</p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-bg">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10 group">
            <div className="h-10 w-10 rounded-xl bg-brand grid place-items-center text-white font-black text-lg">F</div>
            <span className="font-display text-xl font-bold">FansFest</span>
          </Link>

          <h1 className="font-display text-3xl font-bold">Join the fest</h1>
          <p className="text-muted mt-2">Create an account and start connecting.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm text-muted font-medium">Display name</span>
              <input required className="input mt-1.5" placeholder="How fans will see you" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm text-muted font-medium">Email</span>
              <input type="email" required className="input mt-1.5" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm text-muted font-medium">Password</span>
              <input type="password" minLength={6} required className="input mt-1.5" placeholder="6+ characters" value={password} onChange={e=>setPassword(e.target.value)} />
            </label>
            {err && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{err}</div>
            )}
            {msg && (
              <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand">{msg}</div>
            )}
            <button disabled={loading} className="btn-primary w-full py-3 mt-2 text-base">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <div className="text-sm text-muted mt-8 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-semibold hover:text-brand-600 transition">Sign in</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
