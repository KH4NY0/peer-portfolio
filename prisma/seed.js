// Simple seed script to populate demo data
// Usage: npm run seed

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function img(seed) {
  return `https://picsum.photos/seed/${seed}/800/600`;
}

async function main() {
  console.log('Seeding demo data...');

  // Users
  const [alex, sam, taylor] = await Promise.all([
    prisma.user.upsert({ where: { username: 'alex' }, update: {}, create: { username: 'alex', name: 'Alex Rivera' } }),
    prisma.user.upsert({ where: { username: 'sam' }, update: {}, create: { username: 'sam', name: 'Sam Lee' } }),
    prisma.user.upsert({ where: { username: 'taylor' }, update: {}, create: { username: 'taylor', name: 'Taylor Kim' } }),
  ]);

  // Submissions
  const poster = await prisma.submission.create({
    data: {
      title: 'Minimalist Poster Series',
      description: 'Exploring form and color through minimalist posters.',
      category: 'DESIGN',
      authorId: alex.id,
      assets: {
        createMany: {
          data: [
            { url: img('poster1'), type: 'IMAGE', mimeType: 'image/jpeg', width: 800, height: 600 },
            { url: img('poster2'), type: 'IMAGE', mimeType: 'image/jpeg', width: 800, height: 600 },
          ],
        },
      },
    },
  });

  const photo = await prisma.submission.create({
    data: {
      title: 'Golden Hour Portrait',
      description: 'Natural light portrait during golden hour.',
      category: 'PHOTOGRAPHY',
      authorId: sam.id,
      assets: {
        createMany: {
          data: [
            { url: img('photo1'), type: 'IMAGE', mimeType: 'image/jpeg', width: 800, height: 600 },
          ],
        },
      },
    },
  });

  const art = await prisma.submission.create({
    data: {
      title: 'Abstract Shapes Study',
      description: 'Acrylic on canvas.',
      category: 'ART',
      authorId: taylor.id,
      assets: { createMany: { data: [{ url: img('art1'), type: 'IMAGE', mimeType: 'image/jpeg', width: 800, height: 600 }] } },
    },
  });

  // Reviews
  const r1 = await prisma.review.create({
    data: { submissionId: poster.id, reviewerId: sam.id, creativity: 4, technique: 5, presentation: 5, comment: 'Great color balance and typography.' },
  });
  const r2 = await prisma.review.create({
    data: { submissionId: photo.id, reviewerId: taylor.id, creativity: 3, technique: 4, presentation: 4, comment: 'Lovely tones and focus.' },
  });
  const r3 = await prisma.review.create({
    data: { submissionId: art.id, reviewerId: alex.id, creativity: 5, technique: 4, presentation: 4, comment: 'Bold shapes and composition.' },
  });

  // Aggregate updates
  async function recompute(submissionId) {
    const [agg, count] = await Promise.all([
      prisma.review.aggregate({
        where: { submissionId },
        _avg: { creativity: true, technique: true, presentation: true },
      }),
      prisma.review.count({ where: { submissionId } }),
    ]);
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        reviewCount: count,
        avgCreativity: agg._avg.creativity || 0,
        avgTechnique: agg._avg.technique || 0,
        avgPresentation: agg._avg.presentation || 0,
      },
    });
  }
  await Promise.all([recompute(poster.id), recompute(photo.id), recompute(art.id)]);

  // Comments (threaded)
  const c1 = await prisma.reviewComment.create({ data: { reviewId: r1.id, authorId: alex.id, content: 'Thank you! Any suggestions for refining type?' } });
  await prisma.reviewComment.create({ data: { reviewId: r1.id, authorId: sam.id, content: 'Try a lighter weight for captions.', parentId: c1.id } });

  // Reviewer stats & badges
  async function bump(userId, reviews, comments) {
    await prisma.reviewerStat.upsert({
      where: { userId },
      update: { totalReviews: { increment: reviews }, totalComments: { increment: comments }, score: { increment: reviews * 10 + comments * 2 } },
      create: { userId, totalReviews: reviews, totalComments: comments, score: reviews * 10 + comments * 2 },
    });
  }
  await Promise.all([bump(sam.id, 1, 1), bump(taylor.id, 1, 0), bump(alex.id, 1, 1)]);

  // Follows
  await prisma.follow.create({ data: { followerId: alex.id, followingId: sam.id } }).catch(() => {});
  await prisma.follow.create({ data: { followerId: sam.id, followingId: taylor.id } }).catch(() => {});

  console.log('Seed complete.');
}

main().finally(async () => {
  await prisma.$disconnect();
});
