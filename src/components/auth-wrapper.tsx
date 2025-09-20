"use client";

import { ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "./Sidebar";
import MobileSidebarWrapper from "./MobileSidebarWrapper";

interface UserInfo {
  userId: string | null;
  username: string | null;
}

export default function AuthWrapper({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  
  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/', '/about'];
  
  // Handle authentication state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect unauthenticated users from protected routes
  if (!user && !publicRoutes.some(route => pathname.startsWith(route))) {
    router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar userId={user?.id || null} username={user?.username || null} signOut={signOut} />
      </div>
      
      {/* Mobile Sidebar and Header */}
      <MobileSidebarWrapper 
        userId={user?.id || null} 
        username={user?.username || null}
        signOut={signOut}
      >
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity">
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border overflow-y-auto">
            <Sidebar userId={user?.id || null} username={user?.username || null} signOut={signOut} />
          </div>
        </div>
      </MobileSidebarWrapper>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="h-12 md:hidden" />
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
