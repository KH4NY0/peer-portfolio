import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getDbUserByClerk, ensureDbUserFromClerk } from "@/lib/user";

function sanitizeUsername(raw: string) {
  const trimmed = raw.trim().toLowerCase();
  const slug = trimmed.replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
  return slug;
}

const RESERVED = new Set([
  "admin",
  "support",
  "auth",
  "api",
  "account",
  "settings",
  "submit",
  "trending",
  "leaderboard",
  "u",
]);

export async function updateUsername(formData: FormData) {
  "use server";
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");
  const dbUser = (await getDbUserByClerk()) || (await ensureDbUserFromClerk());
  if (!dbUser) redirect("/");
  const userId = dbUser.id;
  const raw = String(formData.get("username") || "");
  const username = sanitizeUsername(raw).slice(0, 24);

  if (username.length < 3) {
    redirect("/account/username?error=" + encodeURIComponent("Username must be at least 3 characters"));
  }
  if (RESERVED.has(username)) {
    redirect("/account/username?error=" + encodeURIComponent("That username is reserved"));
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists && exists.id !== userId) {
    redirect("/account/username?error=" + encodeURIComponent("That username is taken"));
  }

  await prisma.user.update({ where: { id: userId }, data: { username } });
  revalidatePath("/");
  redirect(`/u/${username}`);
}

export default async function UsernamePage({ searchParams }: { searchParams?: { error?: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/");
  }
  const user = await getDbUserByClerk();

  const error = searchParams?.error;

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-semibold">Set your username</h1>
      <p className="opacity-80 text-sm">
        Your public profile will be visible at {" "}
        <code className="px-1 rounded bg-black/10">/u/&lt;username&gt;</code>.
      </p>

      {user?.username ? (
        <div className="text-sm rounded border p-3">
          Current username: <span className="font-medium">@{user.username}</span>
        </div>
      ) : null}

      {error ? (
        <div className="text-sm rounded border border-red-500/40 bg-red-500/10 p-3">
          {error}
        </div>
      ) : null}

      <form action={updateUsername} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm">Username</label>
          <input
            className="input"
            name="username"
            placeholder="e.g. alex-r"
            defaultValue={user?.username || ""}
            autoComplete="off"
          />
          <div className="text-xs muted">3-24 chars, lowercase letters, numbers and dashes only.</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary">Save</button>
          {user?.username ? (
            <Link href={`/u/${user.username}`} className="btn">View profile</Link>
          ) : (
            <Link href="/" className="btn">Cancel</Link>
          )}
        </div>
      </form>
    </div>
  );
}

