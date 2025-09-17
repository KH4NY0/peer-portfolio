import prisma from '@/lib/db';

export async function ensureDefaultBadges() {
  const badges = [
    { slug: 'bronze-reviewer', name: 'Bronze Reviewer', description: 'Score ≥ 50' },
    { slug: 'silver-reviewer', name: 'Silver Reviewer', description: 'Score ≥ 200' },
    { slug: 'gold-reviewer', name: 'Gold Reviewer', description: 'Score ≥ 500' },
  ];
  await Promise.all(
    badges.map((b) =>
      prisma.badge.upsert({
        where: { slug: b.slug },
        update: { name: b.name, description: b.description || null },
        create: { slug: b.slug, name: b.name, description: b.description || null },
      })
    )
  );
}

export async function updateBadgesForUser(userId: string) {
  await ensureDefaultBadges();
  const stat = await prisma.reviewerStat.findUnique({ where: { userId } });
  if (!stat) return;

  const thresholds = [
    { slug: 'bronze-reviewer', minScore: 50 },
    { slug: 'silver-reviewer', minScore: 200 },
    { slug: 'gold-reviewer', minScore: 500 },
  ];

  const earned = await prisma.badgeOnUser.findMany({
    where: { userId },
    select: { badge: { select: { slug: true } } },
  });
  const owned = new Set(earned.map((e) => e.badge.slug));

  for (const t of thresholds) {
    if (stat.score >= t.minScore && !owned.has(t.slug)) {
      const badge = await prisma.badge.findUnique({ where: { slug: t.slug } });
      if (badge) {
        await prisma.badgeOnUser.create({ data: { userId, badgeId: badge.id } });
      }
    }
  }
}
