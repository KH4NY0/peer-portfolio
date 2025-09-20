import prisma from '@/lib/db';
import { getUserStats } from '@/lib/userService';

type UserStats = {
  submissions: number;
  reviews: number;
  followers: number;
  reviewScore: number;
};

export type Achievement = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteria: (user: UserStats) => boolean;
};

export const allAchievements: Achievement[] = [
  // Reviewer Badges
  {
    slug: 'bronze-reviewer',
    name: 'Bronze Reviewer',
    description: 'Score ≥ 50',
    icon: '🥉',
    criteria: (stats) => stats.reviewScore >= 50,
  },
  {
    slug: 'silver-reviewer',
    name: 'Silver Reviewer',
    description: 'Score ≥ 200',
    icon: '🥈',
    criteria: (stats) => stats.reviewScore >= 200,
  },
  {
    slug: 'gold-reviewer',
    name: 'Gold Reviewer',
    description: 'Score ≥ 500',
    icon: '🥇',
    criteria: (stats) => stats.reviewScore >= 500,
  },
  
  // Submissions
  {
    slug: 'first_submission',
    name: 'First Submission',
    description: 'Submit your first portfolio item',
    icon: '📝',
    criteria: (stats) => stats.submissions > 0,
  },
  {
    slug: 'prolific_author',
    name: 'Prolific Author',
    description: 'Submit 10 portfolio items',
    icon: '📚',
    criteria: (stats) => stats.submissions >= 10,
  },
  
  // Reviews
  {
    slug: 'first_review',
    name: 'First Review',
    description: 'Leave your first review',
    icon: '⭐',
    criteria: (stats) => stats.reviews > 0,
  },
  {
    slug: 'active_critic',
    name: 'Active Critic',
    description: 'Leave 10 reviews',
    icon: '💬',
    criteria: (stats) => stats.reviews >= 10,
  },
  
  // Add 25 more achievements here...
  {
    slug: 'newcomer',
    name: 'Newcomer',
    description: 'Create an account',
    icon: '👋',
    criteria: (stats) => stats.submissions >= 0,
  },
  {
    slug: 'rising_star',
    name: 'Rising Star',
    description: 'Get 10 followers',
    icon: '⭐️',
    criteria: (stats) => stats.followers >= 10,
  },
  {
    slug: 'portfolio_builder',
    name: 'Portfolio Builder',
    description: 'Submit 5 portfolio items',
    icon: '📈',
    criteria: (stats) => stats.submissions >= 5,
  },
  {
    slug: 'reviewer_in_training',
    name: 'Reviewer in Training',
    description: 'Leave 5 reviews',
    icon: '📊',
    criteria: (stats) => stats.reviews >= 5,
  },
  {
    slug: 'community_member',
    name: 'Community Member',
    description: 'Participate in the community for 30 days',
    icon: '👥',
    criteria: (stats) => stats.submissions >= 0,
  },
  {
    slug: 'submission_streak',
    name: 'Submission Streak',
    description: 'Submit 3 portfolio items in a row',
    icon: '🔥',
    criteria: (stats) => stats.submissions >= 3,
  },
  {
    slug: 'review_streak',
    name: 'Review Streak',
    description: 'Leave 3 reviews in a row',
    icon: '💪',
    criteria: (stats) => stats.reviews >= 3,
  },
  {
    slug: 'follower_streak',
    name: 'Follower Streak',
    description: 'Get 3 followers in a row',
    icon: '🚀',
    criteria: (stats) => stats.followers >= 3,
  },
  {
    slug: 'submission_master',
    name: 'Submission Master',
    description: 'Submit 20 portfolio items',
    icon: '🏆',
    criteria: (stats) => stats.submissions >= 20,
  },
  {
    slug: 'review_master',
    name: 'Review Master',
    description: 'Leave 20 reviews',
    icon: '📚',
    criteria: (stats) => stats.reviews >= 20,
  },
  {
    slug: 'follower_master',
    name: 'Follower Master',
    description: 'Get 20 followers',
    icon: '👑',
    criteria: (stats) => stats.followers >= 20,
  },
  {
    slug: 'submission_champion',
    name: 'Submission Champion',
    description: 'Submit 50 portfolio items',
    icon: '🏆',
    criteria: (stats) => stats.submissions >= 50,
  },
  {
    slug: 'review_champion',
    name: 'Review Champion',
    description: 'Leave 50 reviews',
    icon: '📚',
    criteria: (stats) => stats.reviews >= 50,
  },
  {
    slug: 'follower_champion',
    name: 'Follower Champion',
    description: 'Get 50 followers',
    icon: '👑',
    criteria: (stats) => stats.followers >= 50,
  },
  {
    slug: 'submission_legend',
    name: 'Submission Legend',
    description: 'Submit 100 portfolio items',
    icon: '🏆',
    criteria: (stats) => stats.submissions >= 100,
  },
  {
    slug: 'review_legend',
    name: 'Review Legend',
    description: 'Leave 100 reviews',
    icon: '📚',
    criteria: (stats) => stats.reviews >= 100,
  },
  {
    slug: 'follower_legend',
    name: 'Follower Legend',
    description: 'Get 100 followers',
    icon: '👑',
    criteria: (stats) => stats.followers >= 100,
  },
  {
    slug: 'submission_hero',
    name: 'Submission Hero',
    description: 'Submit 200 portfolio items',
    icon: '🏆',
    criteria: (stats) => stats.submissions >= 200,
  },
  {
    slug: 'review_hero',
    name: 'Review Hero',
    description: 'Leave 200 reviews',
    icon: '📚',
    criteria: (stats) => stats.reviews >= 200,
  },
  {
    slug: 'follower_hero',
    name: 'Follower Hero',
    description: 'Get 200 followers',
    icon: '👑',
    criteria: (stats) => stats.followers >= 200,
  },
];

export async function ensureDefaultBadges() {
  await Promise.all(
    allAchievements.map((b) =>
      prisma.badge.upsert({
        where: { slug: b.slug },
        update: { 
          name: b.name, 
          description: b.description || null,
          icon: b.icon,
        },
        create: { 
          slug: b.slug, 
          name: b.name, 
          description: b.description || null,
          icon: b.icon,
        },
      })
    )
  );
}

export async function updateBadgesForUser(userId: string) {
  await ensureDefaultBadges();
  const stats = await getUserStats(userId);
  
  const earned = await prisma.badgeOnUser.findMany({
    where: { userId },
    select: { badge: { select: { slug: true } } },
  });
  const owned = new Set(earned.map((e) => e.badge.slug));
  
  for (const achievement of allAchievements) {
    if (achievement.criteria(stats) && !owned.has(achievement.slug)) {
      const badge = await prisma.badge.findUnique({ where: { slug: achievement.slug } });
      if (badge) {
        await prisma.badgeOnUser.create({ data: { userId, badgeId: badge.id } });
      }
    }
  }
}
