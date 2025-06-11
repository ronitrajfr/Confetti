"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { Logo } from "~/components/logo";
import { NavMain } from "~/components/nav-main";
import { AppSidebarSkeleton } from "~/components/app-sidebar-skeleton";

interface subConfettiChannel {
  id: string;
  name: string;
  image: string | null;
}

export const AppSidebar = React.memo(function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const { isPending, error, data } = useQuery({
    queryKey: ["sidebarServers"],
    queryFn: () => fetch("/api/subConfetti").then((res) => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes instead of 1 minute
    gcTime: 10 * 60 * 1000,
  });

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-2xl text-white">
        error occurred while fetching the data
      </div>
    );
  }

  const navItems =
    data?.subConfettiChannels?.map((channel: subConfettiChannel) => ({
      title: channel.name,
      url: `/s/${channel.id}`,
      image: channel.image,
    })) || [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {isPending ? <AppSidebarSkeleton /> : <NavMain items={navItems} />}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
});
