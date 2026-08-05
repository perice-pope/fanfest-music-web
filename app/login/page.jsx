"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
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
    // Fans land back on the fan page; /dashboard is the admin console.
    router.push(params.get("next") || "/");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-bg">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10 group">
            <div className="h-10 w-10 rounded-xl bg-brand grid place-items-center text-white font-black text-lg">F</div>
            <span className="font-display text-xl font-bold">FanFest</span>
          </Link>

          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="text-muted mt-2">Sign in to your FanFest account.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm text-muted font-medium">Email</span>
              <input type="email" required className="input mt-1.5" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm text-muted font-medium">Password</span>
              <input type="password" required className="input mt-1.5" placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)} />
            </label>
            {err && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{err}</div>
            )}
            <button disabled={loading} className="btn-primary w-full py-3 mt-2 text-base">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="text-sm text-muted mt-8 text-center">
            New here?{" "}
            <Link href="/signup" className="text-brand font-semibold hover:text-brand-600 transition">Create an account</Link>
          </div>
        </div>
      </div>

      {/* Right — image */}
      <div className="hidden md:block relative bg-gradient-brand">
        <Image
          src="/images/artist/ejae-press.webp"
          alt="EJAE"
          fill
          className="object-cover mix-blend-multiply opacity-60"
          priority
        />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-card-lg max-w-sm">
            <p className="text-sm italic text-muted">&ldquo;FanFest changed how I connect with my fans. It&apos;s real.&rdquo;</p>
            <p className="text-sm font-semibold mt-2 text-brand">EJAE</p>
          </div>
        </div>
      </div>
    </main>
  );
}
