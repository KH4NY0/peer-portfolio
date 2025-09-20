'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { IconMenu, IconX } from '@/components/icons';

// Dynamically import SidebarContent to avoid server-side rendering issues
const SidebarContent = dynamic(() => import('./SidebarContent'), {
  ssr: false,
  loading: () => <div className="p-4">Loading...</div>,
});

interface MobileSidebarProps {
  userId: string | null;
  username: string | null;
  signOut: () => void;
}

export default function MobileSidebar({ userId, username, signOut }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mobile-sidebar')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const onNavigate = () => setOpen(false);

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
        <div className="h-12 flex items-center justify-between px-4">
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
          </button>
          <Link href="/" className="font-semibold tracking-tight text-foreground">
            ALX Creative Space
          </Link>
          <div className="w-9" />
        </div>
      </div>

      {/* Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setOpen(false)} 
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            className="absolute top-0 left-0 h-full w-[80%] max-w-[300px] p-3"
            style={{ background: "var(--surface-2)", borderRight: "1px solid var(--border)" }}
          >
            <SidebarContent 
              userId={userId} 
              username={username} 
              signOut={signOut}
              onNavigate={onNavigate} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
