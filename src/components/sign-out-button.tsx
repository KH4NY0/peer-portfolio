"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SignOutButton({ signOut }: { signOut: () => void }) {
  
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-red-500 hover:text-red-700"
      onClick={() => signOut()}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}
