import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ensureDbUserFromClerk } from "@/lib/user";
import dynamic from 'next/dynamic';

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

// Dynamically import MobileSidebar with SSR disabled
const MobileSidebar = dynamic(
  () => import('@/components/MobileSidebar').then(mod => mod.default),
  { ssr: false }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user data for the server-side sidebar
  const session = await auth();
  const userId = session?.userId || null;
  const dbUser = userId ? await ensureDbUserFromClerk() : null;
  
  return (
    <ClerkProvider
      appearance={{
        variables: { 
          colorPrimary: '#7C3AED',
          colorBackground: 'hsl(0 0% 100%)',
          colorText: 'hsl(240 10% 3.9%)',
          colorInputBackground: 'hsl(0 0% 100%)',
          colorInputText: 'hsl(240 10% 3.9%)',
        },
        elements: {
          formFieldInput: {
            backgroundColor: 'hsl(0 0% 100%)',
            borderColor: 'hsl(240 5.9% 90%)',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            '&:focus': {
              boxShadow: '0 0 0 2px hsl(263.4, 70%, 50.4%)',
              borderColor: 'hsl(263.4, 70%, 50.4%)',
            }
          }
        }
      }}
    >
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="min-h-screen bg-background font-sans antialiased">
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="md:hidden">
              <MobileSidebar 
                userId={userId} 
                username={dbUser?.username || null} 
              />
            </div>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
