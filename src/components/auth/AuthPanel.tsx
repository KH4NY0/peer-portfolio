"use client";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function AuthPanel({ username }: { username: string | null }) {
  const { user, isSignedIn } = useUser();
  if (!isSignedIn) return null;

  const display = user?.fullName || user?.primaryEmailAddress?.emailAddress || "User";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5">
        <div className="shrink-0">
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="text-sm min-w-0">
          <div className="opacity-90 truncate">{display}</div>
          {username ? (
            <div className="text-xs">
              <Link href={`/u/${username}`} className="underline opacity-80">
                @{username}
              </Link>
            </div>
          ) : (
            <div className="text-xs">
              <Link href="/account/username" className="underline opacity-80">
                Set username
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
