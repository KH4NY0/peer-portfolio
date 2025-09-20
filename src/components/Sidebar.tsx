import SidebarContent from "./SidebarContent";

type SidebarProps = {
  userId: string | null;
  username: string | null;
  signOut: () => void;
};

export default function Sidebar({ userId, username, signOut }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-[250px] shrink-0 h-dvh sticky top-0 p-3 gap-3" style={{background: "var(--surface-2)", borderRight: "1px solid var(--border)"}}>
      <SidebarContent userId={userId} username={username} signOut={signOut} />
    </aside>
  );
}
