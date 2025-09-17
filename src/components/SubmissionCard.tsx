import Link from 'next/link';

export type SubmissionCardProps = {
  submission: {
    id: string;
    title: string;
    description?: string | null;
    createdAt: string | Date;
    author?: { username: string; name?: string | null } | null;
    assets?: Array<{ id: string; url: string; type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'OTHER' }>;
    category?: string | null;
    avgCreativity?: number;
    avgTechnique?: number;
    avgPresentation?: number;
    reviewCount?: number;
  };
};

function formatDate(d: string | Date) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString();
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  const firstImage = submission.assets?.find((a) => a.type === 'IMAGE');
  const avg = ((submission.avgCreativity || 0) + (submission.avgTechnique || 0) + (submission.avgPresentation || 0)) / 3;

  return (
    <div className="card card-hover p-4 flex gap-4">
      {firstImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={firstImage.url} alt={submission.title} className="w-32 h-32 object-cover rounded-md" />
      ) : (
        <div className="w-32 h-32 rounded-md grid place-items-center text-sm" style={{background: 'var(--surface-2)', border: '1px solid var(--border)'}}>No image</div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-lg truncate">{submission.title}</h3>
          <span className="text-xs muted whitespace-nowrap">{formatDate(submission.createdAt)}</span>
        </div>
        <p className="text-sm opacity-90 line-clamp-2 mt-1">{submission.description}</p>
        <div className="mt-2 text-xs flex gap-2 flex-wrap items-center">
          {submission.category && <span className="chip chip-accent">{submission.category}</span>}
          <span className="chip">Avg {avg.toFixed(1)}</span>
          <span className="chip">{submission.reviewCount ?? 0} reviews</span>
          {submission.author?.username && (
            <span className="muted">by <Link className="underline" href={`/u/${submission.author.username}`}>@{submission.author.username}</Link></span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Link className="btn btn-ghost text-sm" href={`/submissions/${submission.id}`}>
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
