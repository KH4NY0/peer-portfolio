import { auth } from "@clerk/nextjs/server";
import { ensureDbUserFromClerk } from "@/lib/user";
import SidebarContent from "./SidebarContent";

export default async function Sidebar() {
  const { userId } = await auth();
  const dbUser = await ensureDbUserFromClerk();
  return (
    <aside className="hidden md:flex md:flex-col w-[250px] shrink-0 h-dvh sticky top-0 p-3 gap-3" style={{background: "var(--surface-2)", borderRight: "1px solid var(--border)"}}>
      <SidebarContent userId={userId ?? null} username={dbUser?.username || null} />
    </aside>
  );
}

