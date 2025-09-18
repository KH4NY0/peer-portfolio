import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Client Components
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider, ToastViewport } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import Sidebar from "@/components/Sidebar";
import MobileSidebarWrapper from "@/components/MobileSidebarWrapper";

// Client-side auth check component
function AuthChecker({ children }: { children: (props: { userId: string | null; username: string | null }) => React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  // Fetch user data when userId changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const userData = await response.json();
            setUsername(userData?.username || null);
          } else {
            setUsername(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUsername(null);
        }
      } else {
        setUsername(null);
      }
    };

    if (isClient) {
      fetchUserData();
    }
  }, [userId, isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't do anything on the server or while loading
  if (!isLoaded || !isClient) {
    return null;
  }

  // If user is not authenticated and not on a public page, redirect to sign-in
  if (!userId && !['/sign-in', '/sign-up', '/'].some(route => pathname.startsWith(route))) {
    router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    return null;
  }

  return <>{children({ userId, username })}</>;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peer Portfolio",
  description: "Showcase your work and connect with peers",
};

// This is a Server Component by default
function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              <ToastViewport />
              <AuthChecker>
                {({ userId, username }) => (
                  <div className="flex h-screen overflow-hidden">
                    {/* Desktop Sidebar - hidden on mobile */}
                    <div className="hidden md:flex">
                      <Sidebar />
                    </div>
                    
                    {/* Mobile Sidebar and Header */}
                    <MobileSidebarWrapper userId={userId} username={username}>
                      {/* Mobile Sidebar Content */}
                      <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity">
                        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border overflow-y-auto">
                          <Sidebar />
                        </div>
                      </div>
                    </MobileSidebarWrapper>
                    
                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden">
                      <div className="h-12 md:hidden" /> {/* Spacer for mobile header */}
                      <div className="p-4 md:p-6">
                        {children}
                      </div>
                    </main>
                  </div>
                )}
              </AuthChecker>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
