"use client";
import { useState } from "react";
import Link from "next/link";
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
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md card p-7">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-brand grid place-items-center text-black font-black">F</div>
          <span className="font-display font-semibold">FansFest</span>
        </Link>
        <h1 className="font-display text-2xl font-semibold">Join the fest</h1>
        <p className="text-sm text-muted mt-1">Create an account to start chatting.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs text-muted">Display name</span>
            <input required className="input mt-1" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Email</span>
            <input type="email" required className="input mt-1" value={email} onChange={e=>setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Password</span>
            <input type="password" minLength={6} required className="input mt-1" value={password} onChange={e=>setPassword(e.target.value)} />
          </label>
          {err && <div className="text-sm text-red-400">{err}</div>}
          {msg && <div className="text-sm text-brand">{msg}</div>}
          <button disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <div className="text-sm text-muted mt-6 text-center">
          Already have an account? <Link href="/login" className="text-text hover:text-brand">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
