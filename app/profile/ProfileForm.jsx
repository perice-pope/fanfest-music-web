"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({ initialProfile, email }) {
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: displayName,
      avatar_url: avatarUrl || null,
    });
    setSaving(false);
    setMsg(error ? `Error: ${error.message}` : "Saved.");
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block">
        <span className="text-xs text-muted">Email</span>
        <input readOnly value={email} className="input mt-1 opacity-70" />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Display name</span>
        <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Avatar URL</span>
        <input className="input mt-1" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
      </label>
      <div className="flex items-center gap-3">
        <button disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save changes"}</button>
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>
    </form>
  );
}
