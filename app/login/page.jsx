"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push(params.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md card p-7">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-brand grid place-items-center text-black font-black">F</div>
          <span className="font-display font-semibold">FansFest</span>
        </Link>
        <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted mt-1">Sign in to your FansFest account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs text-muted">Email</span>
            <input type="email" required className="input mt-1" value={email} onChange={e=>setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs text-muted">Password</span>
            <input type="password" required className="input mt-1" value={password} onChange={e=>setPassword(e.target.value)} />
          </label>
          {err && <div className="text-sm text-red-400">{err}</div>}
          <button disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="text-sm text-muted mt-6 text-center">
          New here? <Link href="/signup" className="text-text hover:text-brand">Create an account</Link>
        </div>
      </div>
    </main>
  );
}
