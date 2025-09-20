'use client';

import { ReactNode, Suspense } from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider, ToastViewport } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';

// Dynamically import the AuthWrapper component with no SSR
const AuthWrapper = dynamic(
  () => import('@/components/auth-wrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
);

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <ToastViewport />
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        }>
          <AuthWrapper>{children}</AuthWrapper>
        </Suspense>
      </ToastProvider>
    </ThemeProvider>
  );
}
