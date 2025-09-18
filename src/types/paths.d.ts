declare module '@/components/theme-provider' {
  import { ThemeProviderProps } from 'next-themes/dist/types';
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}

declare module '@/components/ui/toaster' {
  import * as React from 'react';
  
  export const ToastProvider: React.FC<{ children: React.ReactNode }>;
  export const ToastViewport: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  
  // Add other toast components if needed
  export const Toast: React.FC<any>;
  export const ToastTitle: React.FC<any>;
  export const ToastDescription: React.FC<any>;
  export const ToastAction: React.FC<any>;
  export const ToastClose: React.FC<any>;
}
