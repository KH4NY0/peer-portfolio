import Link from "next/link";
import { IconHome, IconTrend, IconTrophy, IconPlus, IconSearch, IconUser } from "@/components/icons";
import { auth } from "@clerk/nextjs/server";
import AuthPanel from "./auth/AuthPanel";
import { ensureDbUserFromClerk } from "@/lib/user";

const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
  <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5">
    <Icon className="w-4 h-4 opacity-80" />
    <span className="text-sm">{label}</span>
  </Link>
);

export default async function Sidebar() {
  const { userId } = await auth();
  const dbUser = await ensureDbUserFromClerk();
  return (
    <aside className="hidden md:flex md:flex-col w-[250px] shrink-0 h-dvh sticky top-0 p-3 gap-3" style={{background: "var(--surface-2)", borderRight: "1px solid var(--border)"}}>
      <div className="flex items-center justify-between px-2 h-12">
        <Link href="/" className="font-semibold tracking-tight">ALX Creative Space</Link>
      </div>

      <div className="px-2">
        <div className="relative">
          <IconSearch className="w-4 h-4 absolute left-3 top-2.5 opacity-70" />
          <input className="input pl-9" placeholder="Search" />
        </div>
      </div>

      <nav className="px-2 space-y-1">
        <NavItem href="/" icon={IconHome} label="New" />
        <NavItem href="/trending" icon={IconTrend} label="Trending" />
        <NavItem href="/leaderboard" icon={IconTrophy} label="Leaderboard" />
        <NavItem href="/submit" icon={IconPlus} label="Submit" />
      </nav>

      <div className="mt-auto px-2">
        {!userId ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{background: "var(--surface-1)", border: "1px solid var(--border)"}}>
              <IconUser className="w-5 h-5 opacity-80" />
              <div className="text-sm">
                <div className="opacity-90">Guest</div>
                <div className="text-xs muted">Sign in to save your work</div>
              </div>
            </div>
            <Link href="/sign-in" className="btn btn-primary w-full justify-center">Sign in</Link>
          </div>
        ) : (
          <AuthPanel username={dbUser?.username || null} />
        )}
      </div>
    </aside>
  );
}

