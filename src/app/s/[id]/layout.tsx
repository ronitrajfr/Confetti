import type React from "react";
import { DiscordSidebar } from "~/components/members-sidebar";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <main className="flex-1">{children}</main>
        <DiscordSidebar />
      </div>
    </SidebarProvider>
  );
}
