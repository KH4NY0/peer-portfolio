"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ reviewId, parentId }: { reviewId: string; parentId?: string }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [authorUsername, setAuthorUsername] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          parentId: parentId || null,
          content,
          authorName: authorName || null,
          authorUsername: authorUsername || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to post comment");
      }
      setContent("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          className="rounded border px-3 py-2 bg-transparent text-sm"
          placeholder="Your name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <input
          className="rounded border px-3 py-2 bg-transparent text-sm"
          placeholder="Your username (optional)"
          value={authorUsername}
          onChange={(e) => setAuthorUsername(e.target.value)}
        />
      </div>
      <textarea
        className="w-full rounded border px-3 py-2 bg-transparent text-sm"
        rows={3}
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      {error && <div className="text-red-600 text-xs">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded bg-foreground text-background px-3 py-1.5 text-xs"
      >
        {loading ? "Posting..." : parentId ? "Reply" : "Comment"}
      </button>
    </form>
  );
}
