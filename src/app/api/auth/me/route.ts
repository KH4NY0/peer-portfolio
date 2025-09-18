import { NextResponse } from 'next/server';
import { auth as getAuth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = getAuth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        username: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      // If user doesn't exist in our DB, create them
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return new NextResponse('User not found', { status: 404 });
      }

      const primaryEmail = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || 
                          clerkUser.emailAddresses[0]?.emailAddress || null;
      const displayName = clerkUser.username || 
                         [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || 
                         null;
      
      // Generate username
      const baseRaw = clerkUser.username || 
                     (primaryEmail ? primaryEmail.split("@")[0] : "") || 
                     displayName || 
                     "user";
      const username = await uniqueUsernameFrom(baseRaw);

      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          username,
          name: displayName,
          email: primaryEmail,
          image: clerkUser.imageUrl,
        },
        select: {
          id: true,
          clerkId: true,
          username: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return NextResponse.json(newUser);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[AUTH_ME]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Helper function to generate unique username
async function uniqueUsernameFrom(baseRaw: string) {
  const base = toSlug(baseRaw).slice(0, 24) || "user";
  let candidate = base;
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
    const suffix = Math.random().toString(36).slice(2, 6);
    candidate = `${base}-${suffix}`.slice(0, 28);
  }
  return `${base}-${Math.random().toString(36).slice(2, 5)}`;
}

function toSlug(base: string) {
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
