"use client";

import { ClerkProvider as ClerkProviderBase } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  return (
    <ClerkProviderBase
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
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
            color: 'hsl(240 10% 3.9%)',
          },
        },
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}
