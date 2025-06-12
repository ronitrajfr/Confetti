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
import { useMemo } from "react";
import SubConfettiModal from "./subConfetti-modal";

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
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-2xl text-white">
        error occurred while fetching the data
      </div>
    );
  }

  const navItems = useMemo(() => {
    return (
      data?.subConfettiChannels?.map((channel: subConfettiChannel) => ({
        title: channel.name,
        url: `/s/${channel.id}`,
        image: channel.image,
      })) || []
    );
  }, [data?.subConfettiChannels]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
        <SubConfettiModal />
      </SidebarHeader>
      <SidebarContent>
        {isPending ? <AppSidebarSkeleton /> : <NavMain items={navItems} />}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
});
