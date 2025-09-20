"use client";
import Link from "next/link";
import { IconHome, IconTrend, IconTrophy, IconPlus, IconSearch, IconUser } from "@/components/icons";
import { LayoutDashboard } from 'lucide-react';
import AuthPanel from "./auth/AuthPanel";
import SignOutButton from "./sign-out-button";

type SidebarContentProps = {
  userId: string | null;
  username: string | null;
  signOut: () => void;
  onNavigate?: () => void;
};

export default function SidebarContent({ userId, username, signOut, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full gap-3">
      {/* Brand */}
      <div className="flex items-center justify-between px-2 h-12">
        <Link href="/" className="font-semibold tracking-tight" onClick={onNavigate}>
          ALX Creative Space
        </Link>
      </div>

      {/* Search */}
      <div className="px-2">
        <div className="relative">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />
          <input
            type="search"
            className="input pl-10"
            placeholder="Search"
            aria-label="Search"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="px-2 space-y-1">
        <SidebarLink href="/" icon={IconHome} label="New" onNavigate={onNavigate} />
        <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onNavigate={onNavigate} />
        <SidebarLink href="/trending" icon={IconTrend} label="Trending" onNavigate={onNavigate} />
        <SidebarLink href="/leaderboard" icon={IconTrophy} label="Leaderboard" onNavigate={onNavigate} />
        <SidebarLink href="/submit" icon={IconPlus} label="Submit" onNavigate={onNavigate} />
      </nav>

      {/* Auth */}
      <div className="mt-auto px-2">
        {!userId ? (
          <div className="space-y-3">
            <div
              className="flex items-center gap-3 px-2 py-2 rounded-lg"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
            >
              <IconUser className="w-5 h-5 opacity-80" />
              <div className="text-sm">
                <div className="opacity-90">Guest</div>
                <div className="text-xs muted">Sign in to save your work</div>
              </div>
            </div>
            <Link href="/sign-in" className="btn btn-primary w-full justify-center" onClick={onNavigate}>
              Sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AuthPanel username={username} />
            <SignOutButton signOut={signOut} />
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: any;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5" onClick={onNavigate}>
      <Icon className="w-4 h-4 opacity-80" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
