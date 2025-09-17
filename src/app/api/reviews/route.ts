import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { updateBadgesForUser } from '@/lib/achievements';

function clampRating(n: any) {
  const num = Number(n);
  if (!Number.isFinite(num)) return null;
  return Math.min(5, Math.max(1, Math.round(num)));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get('submissionId') || undefined;
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '10')));

  const where: any = {};
  if (submissionId) where.submissionId = submissionId;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      submissionId,
      reviewerUsername,
      reviewerName,
      creativity,
      technique,
      presentation,
      comment,
    } = body || {};

    if (!submissionId || typeof submissionId !== 'string') {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    const c = clampRating(creativity);
    const t = clampRating(technique);
    const p = clampRating(presentation);
    if (c === null || t === null || p === null) {
      return NextResponse.json({ error: 'ratings must be numbers 1-5' }, { status: 400 });
    }

    // Find or create reviewer
    let username: string | undefined = reviewerUsername || undefined;
    if (!username) {
      const base = (reviewerName || 'reviewer').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'reviewer';
      username = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    const reviewer = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, name: reviewerName || null },
    });

    let review;
    try {
      review = await prisma.review.create({
        data: {
          submissionId,
          reviewerId: reviewer.id,
          creativity: c,
          technique: t,
          presentation: p,
          comment: comment || null,
        },
        include: { reviewer: true },
      });
    } catch (e: any) {
      // Unique constraint (one review per submission+reviewer)
      return NextResponse.json({ error: 'You have already reviewed this submission.' }, { status: 409 });
    }

    // Update aggregates on submission
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

    // Update reviewer stats
    await prisma.reviewerStat.upsert({
      where: { userId: reviewer.id },
      update: {
        totalReviews: { increment: 1 },
        score: { increment: 10 }, // placeholder scoring: +10 per review
      },
      create: {
        userId: reviewer.id,
        totalReviews: 1,
        score: 10,
        totalComments: 0,
      },
    });

    // Check and award badges based on updated score
    await updateBadgesForUser(reviewer.id);

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error('Create review error', err);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
