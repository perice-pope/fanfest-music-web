"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AvatarUpload from "@/components/AvatarUpload";

export default function ProfileForm({ initialProfile, email, userId }) {
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl || null,
    });
    setSaving(false);
    setMsg(error ? `Error: ${error.message}` : "Saved!");
    if (!error) {
      setTimeout(() => setMsg(null), 3000);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Avatar upload */}
      <div className="flex justify-center py-2">
        <AvatarUpload
          userId={userId}
          currentUrl={avatarUrl}
          onUploaded={(url) => setAvatarUrl(url)}
        />
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-muted font-medium">Email</span>
          <input readOnly value={email} className="input mt-1.5 opacity-60 cursor-not-allowed" />
        </label>
        <label className="block">
          <span className="text-sm text-muted font-medium">Display name</span>
          <input className="input mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How fans see you" />
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button disabled={saving} className="btn-primary px-6">
          {saving ? "Saving..." : "Save changes"}
        </button>
        {msg && (
          <span className={`text-sm font-medium ${msg.startsWith("Error") ? "text-red-400" : "text-success"}`}>
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}
