import prisma from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

function toSlug(base: string) {
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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

export async function ensureDbUserFromClerk() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (user) return user;

  const cu = await currentUser();
  if (!cu) return null;

  const primaryEmail = cu.emailAddresses.find((e) => e.id === cu.primaryEmailAddressId)?.emailAddress || cu.emailAddresses[0]?.emailAddress || null;
  const displayName = cu.username || [cu.firstName, cu.lastName].filter(Boolean).join(" ") || null;
  const image = cu.imageUrl || null;

  // Generate username preference: Clerk username -> email local-part -> name
  const baseRaw = cu.username || (primaryEmail ? primaryEmail.split("@")[0] : "") || displayName || "user";
  const username = await uniqueUsernameFrom(baseRaw);

  user = await prisma.user.create({
    data: {
      clerkId: userId,
      username,
      name: displayName,
      email: primaryEmail,
      image,
    },
  });

  return user;
}

export async function getDbUserByClerk() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

