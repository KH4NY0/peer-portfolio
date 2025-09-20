'use client';

import { ClerkProvider as ClerkProviderBase } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  return (
    <ClerkProviderBase
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}
