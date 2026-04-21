"use client";

import { useEffect, useRef, useState } from "react";

export default function LinkAppModal({ open, app, onClose, onLink }) {
  const [handle, setHandle] = useState("");
  const inputRef = useRef(null);

  // Reset and autofocus when modal opens
  useEffect(() => {
    if (open) {
      setHandle("");
      // Focus next tick so transition doesn't interfere
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !app) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = handle.trim().replace(/^@/, "");
    if (!trimmed) return;
    onLink(app.key, trimmed);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-card-lg border border-border/60 animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
          <div className="h-10 w-10 rounded-xl bg-brand-50 grid place-items-center shrink-0">
            {app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base">Link your {app.name}</h3>
            <p className="text-xs text-muted">Connect your account to earn XP from activity</p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 rounded-lg"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label htmlFor="handle" className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Your {app.name} handle
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
              <input
                ref={inputRef}
                id="handle"
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={app.placeholder || "yourhandle"}
                className="input pl-8"
                autoComplete="off"
              />
            </div>
            <p className="text-[11px] text-muted mt-1.5">
              Use hashtags <span className="text-brand font-medium">#EJAE</span> <span className="text-brand font-medium">#TimeAfterTime</span> and we&apos;ll award XP.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-surface2 text-text border border-border text-sm font-semibold hover:bg-lavender-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!handle.trim()}
              className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Link account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
