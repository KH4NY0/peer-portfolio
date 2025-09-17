import prisma from '@/lib/db';
import ReviewForm from '@/components/ReviewForm';
import CommentForm from '@/components/CommentForm';
import Link from 'next/link';

function formatDate(d: Date) {
  return new Date(d).toLocaleString();
}

function buildCommentTree(comments: Array<any>) {
  const byId: Record<string, any> = {};
  const roots: any[] = [];
  comments.forEach((c) => (byId[c.id] = { ...c, children: [] }));
  comments.forEach((c) => {
    const node = byId[c.id];
    if (c.parentId && byId[c.parentId]) {
      byId[c.parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function CommentsTree({ nodes, depth = 0 }: { nodes: any[]; depth?: number }) {
  if (!nodes?.length) return null;
  return (
    <ul className="space-y-3">
      {nodes.map((n) => (
        <li key={n.id} className="border-l pl-3">
          <div className="text-sm">
            <div className="opacity-70 mb-1">
              <span>@{n.author?.username || 'user'}</span>
              <span className="ml-2">{formatDate(n.createdAt)}</span>
            </div>
            <div>{n.content}</div>
          </div>
          <div className="mt-2">
            <CommentForm reviewId={n.reviewId} parentId={n.id} />
          </div>
          {n.children?.length ? (
            <div className="mt-3">
              <CommentsTree nodes={n.children} depth={depth + 1} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      author: true,
      assets: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: true,
          comments: { orderBy: { createdAt: 'asc' }, include: { author: true } },
        },
      },
    },
  });

  if (!submission) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Submission not found</h1>
        <Link href="/" className="underline">← Back to feed</Link>
      </div>
    );
  }

  const avg = (submission.avgCreativity + submission.avgTechnique + submission.avgPresentation) / 3;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-sm opacity-70">{formatDate(submission.createdAt)} • by @{submission.author?.username}</div>
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        {submission.description && <p className="opacity-90">{submission.description}</p>}
        <div className="text-sm opacity-70 flex gap-3">
          {submission.category && <span>Category: {submission.category}</span>}
          <span>Reviews: {submission.reviewCount}</span>
          <span>Avg: {avg.toFixed(1)}</span>
          <span>C {submission.avgCreativity.toFixed(1)} • T {submission.avgTechnique.toFixed(1)} • P {submission.avgPresentation.toFixed(1)}</span>
        </div>
      </div>

      {submission.assets.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {submission.assets.map((asset) => (
            <div key={asset.id} className="rounded border overflow-hidden">
              {asset.type === 'IMAGE' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.url} alt={submission.title} className="w-full h-64 object-cover" />
              ) : (
                <a href={asset.url} target="_blank" rel="noreferrer" className="block p-4 hover:underline">
                  {asset.type} asset →
                </a>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <section className="space-y-4">
        <ReviewForm submissionId={submission.id} />
        <div className="space-y-6">
          {submission.reviews.map((r) => {
            const tree = buildCommentTree(r.comments);
            return (
              <div key={r.id} className="p-4 border rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Review by @{r.reviewer?.username}</div>
                  <div className="text-sm opacity-70">{formatDate(r.createdAt)}</div>
                </div>
                <div className="text-sm">
                  <div>Creativity: {r.creativity} • Technique: {r.technique} • Presentation: {r.presentation}</div>
                  {r.comment && <p className="mt-1 opacity-90">{r.comment}</p>}
                </div>
                <div className="space-y-3">
                  <CommentForm reviewId={r.id} />
                  {tree.length ? (
                    <div className="mt-2">
                      <CommentsTree nodes={tree} />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
