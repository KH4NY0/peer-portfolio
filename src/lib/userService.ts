import prisma from '@/lib/db';
import { Achievement } from '@/lib/achievements';

export async function getUserStats(userId: string) {
  return {
    submissions: await prisma.submission.count({ 
      where: { 
        author: { id: userId } 
      } 
    }),
    reviews: await prisma.review.count({ 
      where: { 
        reviewerId: userId 
      } 
    }),
    followers: await prisma.follow.count({ where: { followingId: userId } }),
    reviewScore: 0, // We'll implement scoring later
  };
}

export async function fetchEarnedBadges(userId: string): Promise<Achievement[]> {
  const badges = await prisma.badgeOnUser.findMany({
    where: { userId },
    include: { badge: true }
  });

  return badges.map(b => ({
    slug: b.badge.slug,
    name: b.badge.name,
    description: b.badge.description || '',
    icon: b.badge.icon || '',
    criteria: () => false // Not needed for display
  }));
}
