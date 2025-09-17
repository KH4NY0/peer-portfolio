import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { MediaType, Prisma } from '@prisma/client';

function toMediaTypeFromMime(mime?: string | null): MediaType {
  if (!mime) return MediaType.OTHER;
  if (mime.startsWith('image/')) return MediaType.IMAGE;
  if (mime.startsWith('video/')) return MediaType.VIDEO;
  if (mime.startsWith('audio/')) return MediaType.AUDIO;
  if (mime === 'application/pdf') return MediaType.PDF;
  return MediaType.OTHER;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '12')));
  const category = searchParams.get('category') || undefined;

  const where: any = {};
  if (category) where.category = category as any;

  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: true, assets: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.submission.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, authorName, authorUsername, assets } = body || {};

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Find or create author by username; fallback to generated anon.
    let username: string | undefined = authorUsername;
    if (!username) {
      const base = (authorName || 'anon').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'anon';
      username = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, name: authorName || null },
    });

    const normalizedAssets: Prisma.MediaAssetCreateManySubmissionInput[] = Array.isArray(assets)
      ? assets.map((a: any) => ({
          url: String(a.url),
          mimeType: a.mimeType ? String(a.mimeType) : null,
          type: toMediaTypeFromMime(a.mimeType),
          width: typeof a.width === 'number' ? a.width : null,
          height: typeof a.height === 'number' ? a.height : null,
          durationSec: typeof a.durationSec === 'number' ? a.durationSec : null,
          sizeBytes: typeof a.sizeBytes === 'number' ? a.sizeBytes : null,
        }))
      : [];

    const created = await prisma.submission.create({
      data: {
        title,
        description: description || null,
        // Cast input string to Prisma enum to satisfy types; values come from a controlled select.
        category: (category as any) || null,
        authorId: user.id,
        assets: { createMany: { data: normalizedAssets } },
      },
      include: { author: true, assets: true },
    });

    return NextResponse.json({ submission: created }, { status: 201 });
  } catch (err) {
    console.error('Create submission error', err);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
