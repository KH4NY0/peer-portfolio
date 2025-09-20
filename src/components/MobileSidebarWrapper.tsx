'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const MobileSidebar = dynamic(
  () => import('@/components/MobileSidebar').then(mod => mod.default),
  { ssr: false }
);

type MobileSidebarWrapperProps = {
  children: React.ReactNode;
  userId: string | null;
  username: string | null;
  signOut: () => void;
};

export default function MobileSidebarWrapper({ 
  children, 
  userId, 
  username,
  signOut
}: MobileSidebarWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [userId, username]);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border p-2 flex justify-between items-center">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="font-semibold">Peer Portfolio</div>
        <div className="w-10" />
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full z-40 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out md:hidden">
            <Sidebar userId={userId} username={username} signOut={signOut} />
          </div>
        </>
      )}
      
      {children}
    </>
  );
}
