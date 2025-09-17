import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

async function getUsers(followerUsername: string, targetUsername: string) {
  const [follower, target] = await Promise.all([
    prisma.user.upsert({
      where: { username: followerUsername },
      update: {},
      create: { username: followerUsername },
    }),
    prisma.user.findUnique({ where: { username: targetUsername } }),
  ]);
  if (!target) throw new Error('Target user not found');
  if (follower.id === target.id) throw new Error('Cannot follow yourself');
  return { follower, target };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const followerUsername = searchParams.get('followerUsername') || '';
    const targetUsername = searchParams.get('targetUsername') || '';
    if (!followerUsername || !targetUsername) {
      return NextResponse.json({ error: 'followerUsername and targetUsername are required' }, { status: 400 });
    }
    const follower = await prisma.user.findUnique({ where: { username: followerUsername } });
    const target = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) return NextResponse.json({ following: false, counts: { followers: 0, following: 0 } });

    const [rel, followers, following] = await Promise.all([
      follower
        ? prisma.follow.findUnique({ where: { followerId_followingId: { followerId: follower.id, followingId: target.id } } })
        : Promise.resolve(null),
      prisma.follow.count({ where: { followingId: target.id } }),
      prisma.follow.count({ where: { followerId: target.id } }),
    ]);

    return NextResponse.json({ following: !!rel, counts: { followers, following } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const followerUsername = body?.followerUsername;
    const targetUsername = body?.targetUsername;
    if (!followerUsername || !targetUsername) {
      return NextResponse.json({ error: 'followerUsername and targetUsername are required' }, { status: 400 });
    }
    const { follower, target } = await getUsers(followerUsername, targetUsername);

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: follower.id, followingId: target.id } },
      update: {},
      create: { followerId: follower.id, followingId: target.id },
    });

    const [followers, following] = await Promise.all([
      prisma.follow.count({ where: { followingId: target.id } }),
      prisma.follow.count({ where: { followerId: target.id } }),
    ]);

    return NextResponse.json({ following: true, counts: { followers, following } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const followerUsername = body?.followerUsername;
    const targetUsername = body?.targetUsername;
    if (!followerUsername || !targetUsername) {
      return NextResponse.json({ error: 'followerUsername and targetUsername are required' }, { status: 400 });
    }
    const { follower, target } = await getUsers(followerUsername, targetUsername);

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: follower.id, followingId: target.id } },
    }).catch(() => null);

    const [followers, following] = await Promise.all([
      prisma.follow.count({ where: { followingId: target.id } }),
      prisma.follow.count({ where: { followerId: target.id } }),
    ]);

    return NextResponse.json({ following: false, counts: { followers, following } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 400 });
  }
}
