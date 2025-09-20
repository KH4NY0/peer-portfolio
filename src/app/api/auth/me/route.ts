import { NextResponse } from 'next/server';
import { auth as getAuth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const userId = user.id;

    // Get user from database
    const userFromDb = await prisma.user.findUnique({
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

    if (!userFromDb) {
      // If user doesn't exist in our DB, create them
      const primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || 
                          user.emailAddresses[0]?.emailAddress || null;
      const displayName = user.username || 
                         [user.firstName, user.lastName].filter(Boolean).join(" ") || 
                         null;
      
      // Generate username
      const baseRaw = user.username || 
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
          image: user.imageUrl,
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

    return NextResponse.json(userFromDb);
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
