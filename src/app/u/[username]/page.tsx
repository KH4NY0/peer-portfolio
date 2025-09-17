import prisma from '@/lib/db';
import SubmissionCard from '@/components/SubmissionCard';
import FollowButton from '@/components/FollowButton';
import Link from 'next/link';

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const username = params.username;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      badges: { include: { badge: true } },
    },
  });

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">User not found</h1>
        <Link href="/" className="underline">← Back to feed</Link>
      </div>
    );
  }

  const [followers, following, submissions, reviews] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.submission.findMany({ where: { authorId: user.id }, orderBy: { createdAt: 'desc' }, include: { author: true, assets: true } }),
    prisma.review.findMany({ where: { reviewerId: user.id }, orderBy: { createdAt: 'desc' }, include: { submission: true } }),
  ]);

  return (
    <div className="space-y-8">
      <section className="flex items-start justify-between gap-6">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-semibold truncate">@{user.username}</h1>
          {user.name && <div className="opacity-80 truncate">{user.name}</div>}
          {user.bio && <p className="opacity-80 max-w-prose">{user.bio}</p>}
          <div className="text-sm opacity-70 flex items-center gap-4">
            <span>{followers} followers</span>
            <span>{following} following</span>
          </div>
          {user.badges.length ? (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {user.badges.map((b) => (
                <span key={b.badgeId} className="rounded px-2 py-0.5 border text-xs">
                  {b.badge.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <FollowButton targetUsername={username} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Submissions</h2>
        {submissions.length ? (
          <div className="grid grid-cols-1 gap-4">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} submission={s as any} />
            ))}
          </div>
        ) : (
          <div className="text-sm opacity-80">No submissions yet.</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reviews Given</h2>
        {reviews.length ? (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded border p-3">
                <div className="text-sm opacity-70">{new Date(r.createdAt).toLocaleString()}</div>
                <div className="mt-1">
                  <Link href={`/submissions/${r.submissionId}`} className="underline font-medium">
                    {r.submission?.title || 'View submission'}
                  </Link>
                </div>
                <div className="text-sm">C {r.creativity} • T {r.technique} • P {r.presentation}</div>
                {r.comment && <p className="text-sm mt-1 opacity-90">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm opacity-80">No reviews yet.</div>
        )}
      </section>
    </div>
  );
}
