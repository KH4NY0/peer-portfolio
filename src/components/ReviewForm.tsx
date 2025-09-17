"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/Stars";

export default function ReviewForm({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerUsername, setReviewerUsername] = useState("");
  const [creativity, setCreativity] = useState(3);
  const [technique, setTechnique] = useState(3);
  const [presentation, setPresentation] = useState(3);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          reviewerName: reviewerName || null,
          reviewerUsername: reviewerUsername || null,
          creativity,
          technique,
          presentation,
          comment,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit review");
      }
      router.refresh();
      setComment("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-4">
      <h3 className="font-semibold">Leave a review</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Your name (optional)</label>
          <input className="mt-1 input" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Your username (optional)</label>
          <input className="mt-1 input" value={reviewerUsername} onChange={(e) => setReviewerUsername(e.target.value)} placeholder="e.g. sam-d" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm">Creativity</label>
          <div className="mt-1">
            <StarRating value={creativity} onChange={setCreativity} />
          </div>
        </div>
        <div>
          <label className="text-sm">Technique</label>
          <div className="mt-1">
            <StarRating value={technique} onChange={setTechnique} />
          </div>
        </div>
        <div>
          <label className="text-sm">Presentation</label>
          <div className="mt-1">
            <StarRating value={presentation} onChange={setPresentation} />
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm">Comment (optional)</label>
        <textarea className="mt-1 textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
