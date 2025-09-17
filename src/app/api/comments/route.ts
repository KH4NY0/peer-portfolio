import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { updateBadgesForUser } from '@/lib/achievements';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get('reviewId') || undefined;
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')));

  const where: any = {};
  if (reviewId) where.reviewId = reviewId;

  const [items, total] = await Promise.all([
    prisma.reviewComment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { author: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.reviewComment.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId, authorUsername, authorName, content, parentId } = body || {};

    if (!reviewId || typeof reviewId !== 'string') {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    // Find or create author
    let username: string | undefined = authorUsername || undefined;
    if (!username) {
      const base = (authorName || 'commenter').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'commenter';
      username = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    const author = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, name: authorName || null },
    });

    const created = await prisma.reviewComment.create({
      data: {
        reviewId,
        authorId: author.id,
        content,
        parentId: parentId || null,
      },
      include: { author: true },
    });

    // Update reviewer stats for author
    await prisma.reviewerStat.upsert({
      where: { userId: author.id },
      update: {
        totalComments: { increment: 1 },
        score: { increment: 2 }, // placeholder: +2 per comment
      },
      create: {
        userId: author.id,
        totalReviews: 0,
        totalComments: 1,
        score: 2,
      },
    });

    // Check and award badges based on updated score
    await updateBadgesForUser(author.id);

    return NextResponse.json({ comment: created }, { status: 201 });
  } catch (err) {
    console.error('Create comment error', err);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
