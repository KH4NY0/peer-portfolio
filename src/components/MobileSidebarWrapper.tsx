'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const MobileSidebar = dynamic(
  () => import('@/components/MobileSidebar').then(mod => mod.default),
  { ssr: false }
);

interface MobileSidebarWrapperProps {
  userId: string | null;
  username: string | null;
  children: ReactNode;
}

export default function MobileSidebarWrapper({ 
  userId, 
  username, 
  children 
}: MobileSidebarWrapperProps) {
  return (
    <>
      <MobileSidebar userId={userId} username={username} />
      {children}
    </>
  );
}
