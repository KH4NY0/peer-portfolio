"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Card } from "@/components/UI";

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorUsername, setAuthorUsername] = useState("");
  const [assetUrls, setAssetUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("file", f));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok && Array.isArray(data.assets)) {
      const urls = data.assets.map((a: any) => a.url).join("\n");
      setAssetUrls((prev) => (prev ? prev + "\n" + urls : urls));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const urls = assetUrls
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const assets = urls.map((url) => ({ url }));

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: category || null,
          authorName: authorName || null,
          authorUsername: authorUsername || null,
          assets,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create submission");
      }

      const data = await res.json();
      const id = data.submission?.id;
      if (id) router.push(`/submissions/${id}`);
      else router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Submit your project" />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="mt-1 input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Minimalist Poster Series"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 textarea"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            className="mt-1 select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select a category</option>
            <option value="ART">Art</option>
            <option value="DESIGN">Design</option>
            <option value="MUSIC">Music</option>
            <option value="PHOTOGRAPHY">Photography</option>
            <option value="WRITING">Writing</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Author name (optional)</label>
            <input
              className="mt-1 input"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Author username (optional)</label>
            <input
              className="mt-1 input"
              value={authorUsername}
              onChange={(e) => setAuthorUsername(e.target.value)}
              placeholder="e.g. alex-k"
            />
          </div>
        </div>
        <Card>
          <div className="p-4 space-y-3">
            <label className="block text-sm font-medium">Assets</label>
            <div className="text-xs muted">Paste direct URLs or upload files (dev local storage). Uploaded files will be added as URLs below.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <textarea
                className="textarea"
                rows={4}
                value={assetUrls}
                onChange={(e) => setAssetUrls(e.target.value)}
                placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.png"}
              />
              <div>
                <input type="file" multiple onChange={(e) => handleUpload(e.target.files)} className="input" />
                <div className="text-xs muted mt-2">Max 25MB per file in dev.</div>
              </div>
            </div>
          </div>
        </Card>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      <p className="text-sm muted">
        Note: Uploads via storage (S3/Supabase) will be added later. For now, paste URLs to media. Images display in feeds; other media types will appear as links.
      </p>
    </div>
  );
}
