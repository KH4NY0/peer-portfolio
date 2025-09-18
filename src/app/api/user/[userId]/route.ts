import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify the requesting user is the same as the requested user
    const { userId: clerkId } = auth();
    if (!clerkId || clerkId !== params.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { clerkId: params.userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
