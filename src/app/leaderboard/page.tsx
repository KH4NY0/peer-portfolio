import prisma from '@/lib/db';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const top = await prisma.reviewerStat.findMany({
    orderBy: [{ score: 'desc' }, { totalReviews: 'desc' }],
    take: 25,
    include: {
      user: {
        include: {
          badges: { include: { badge: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Top Reviewers</h1>
      {top.length ? (
        <ol className="space-y-3">
          {top.map((row, idx) => (
            <li key={row.userId} className="flex items-center justify-between rounded border p-3">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-8 text-right font-mono">{idx + 1}</div>
                <div className="min-w-0">
                  <div className="truncate">
                    <Link href={`/u/${row.user.username}`} className="font-medium hover:underline">
                      @{row.user.username}
                    </Link>
                  </div>
                  <div className="text-xs opacity-70 truncate">{row.user.name}</div>
                  {row.user.badges.length ? (
                    <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
                      {row.user.badges.map((b) => (
                        <span key={b.badgeId} className="rounded px-2 py-0.5 border text-xs">
                          {b.badge.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="text-sm whitespace-nowrap">
                <span className="font-mono">{row.score.toFixed(0)}</span> pts • {row.totalReviews} reviews • {row.totalComments} comments
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-sm opacity-80">No reviewers yet.</div>
      )}
    </div>
  );
}
