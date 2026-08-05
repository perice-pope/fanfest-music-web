"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const TICK_MS = 60_000; // one minute

/**
 * Everything live on the fan page: XP balance, the once-a-minute presence
 * award, and the Spotify play scan.
 *
 * Signed out, this is inert — it reports the demo XP passed in and never
 * calls the server, so the page stays browsable without an account.
 */
export function useFanEngine({ signedIn, initialXp, onAward }) {
  const [xp, setXp] = useState(initialXp);
  const [pulsing, setPulsing] = useState(false);
  const [spotify, setSpotify] = useState({ connected: false, recent: [], loading: signedIn });

  // Held in a ref so the interval below never needs to be torn down and
  // rebuilt when the callback identity changes.
  const onAwardRef = useRef(onAward);
  useEffect(() => { onAwardRef.current = onAward; }, [onAward]);

  const bumpXp = useCallback((next) => {
    setXp((prev) => {
      if (next > prev) {
        setPulsing(true);
        setTimeout(() => setPulsing(false), 700);
      }
      return next;
    });
  }, []);

  // ─── Presence: +10 XP per minute the tab is actually visible ───
  const tick = useCallback(async () => {
    if (!signedIn || document.visibilityState !== "visible") return;

    try {
      const res = await fetch("/api/points/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "presence" }),
      });
      if (!res.ok) return;

      const data = await res.json();
      bumpXp(data.xp);
      // The server dedupes by minute, so `awarded` is false when another tab
      // already claimed this minute. Only toast for a real award.
      if (data.awarded) onAwardRef.current?.(`+${data.points}XP for hanging out!`);
    } catch {
      // Offline or mid-deploy — the next tick will catch up.
    }
  }, [signedIn, bumpXp]);

  // ─── Spotify: turn recent plays into points ───
  const scanSpotify = useCallback(async ({ quiet = false } = {}) => {
    if (!signedIn) return;

    try {
      const res = await fetch("/api/spotify/scan", { method: "POST" });
      if (!res.ok) {
        setSpotify((s) => ({ ...s, loading: false }));
        return;
      }

      const data = await res.json();
      setSpotify({
        connected: Boolean(data.connected),
        recent: data.recent || [],
        scanned: data.scanned || 0,
        artistPlays: data.artistPlays || 0,
        error: data.error || null,
        loading: false,
      });

      if (typeof data.xp === "number") bumpXp(data.xp);
      if (!quiet && data.pointsEarned > 0) {
        onAwardRef.current?.(
          `+${data.pointsEarned}XP from ${data.newPlays} Spotify play${data.newPlays === 1 ? "" : "s"}!`
        );
      }
    } catch {
      setSpotify((s) => ({ ...s, loading: false }));
    }
  }, [signedIn, bumpXp]);

  // Kick off: pull the true balance and scan Spotify once on mount.
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/points/me");
        const data = await res.json();
        if (!cancelled && typeof data.xp === "number") setXp(data.xp);
      } catch {}
      if (!cancelled) scanSpotify({ quiet: false });
    })();

    return () => { cancelled = true; };
  }, [signedIn, scanSpotify]);

  // The heartbeat. Presence every minute, Spotify rescan alongside it.
  useEffect(() => {
    if (!signedIn) return;

    const id = setInterval(() => {
      tick();
      scanSpotify({ quiet: false });
    }, TICK_MS);

    // Returning to the tab shouldn't mean waiting out a full minute.
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [signedIn, tick, scanSpotify]);

  /** Fire a named award (trivia, link_social, invite …). */
  const award = useCallback(async (kind, metadata = {}) => {
    if (!signedIn) return { awarded: false };

    try {
      const res = await fetch("/api/points/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, metadata }),
      });
      if (!res.ok) return { awarded: false };

      const data = await res.json();
      bumpXp(data.xp);
      return data;
    } catch {
      return { awarded: false };
    }
  }, [signedIn, bumpXp]);

  return { xp, pulsing, spotify, award, scanSpotify, setXp: bumpXp };
}
