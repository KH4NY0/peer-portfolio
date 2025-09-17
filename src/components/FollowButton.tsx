"use client";

import { useEffect, useState } from "react";

type Counts = { followers: number; following: number };

export default function FollowButton({ targetUsername }: { targetUsername: string }) {
  const [followerUsername, setFollowerUsername] = useState<string>("");
  const [following, setFollowing] = useState<boolean>(false);
  const [counts, setCounts] = useState<Counts>({ followers: 0, following: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("pp_username") : "";
    if (saved) setFollowerUsername(saved);
  }, []);

  useEffect(() => {
    async function load() {
      if (!targetUsername) return;
      try {
        const params = new URLSearchParams();
        if (followerUsername) params.set("followerUsername", followerUsername);
        params.set("targetUsername", targetUsername);
        const res = await fetch(`/api/follow?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setFollowing(!!data.following);
          if (data.counts) setCounts(data.counts);
        }
      } catch {}
    }
    load();
  }, [followerUsername, targetUsername]);

  async function toggleFollow() {
    if (!followerUsername) return;
    setLoading(true);
    try {
      const method = following ? "DELETE" : "POST";
      const res = await fetch("/api/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerUsername, targetUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data.following);
        if (data.counts) setCounts(data.counts);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {!followerUsername ? (
        <div className="flex items-center gap-2">
          <input
            className="rounded border px-2 py-1 text-sm bg-transparent"
            placeholder="Your username"
            value={followerUsername}
            onChange={(e) => setFollowerUsername(e.target.value)}
          />
          <button
            className="rounded bg-foreground text-background px-2 py-1 text-xs"
            onClick={() => {
              if (followerUsername) localStorage.setItem("pp_username", followerUsername);
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <button
          className="rounded bg-foreground text-background px-3 py-1.5 text-sm"
          onClick={toggleFollow}
          disabled={loading}
        >
          {loading ? "…" : following ? "Unfollow" : "Follow"}
        </button>
      )}
      <div className="text-xs opacity-70">Followers: {counts.followers}</div>
    </div>
  );
}
