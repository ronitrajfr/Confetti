"use client";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import * as React from "react";
import { NavMain } from "~/components/nav-main";
import { Logo } from "~/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";
import { redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface subConfettiChannel {
  id: string;
  name: string;
  image: string | null;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isPending, error, data } = useQuery({
    queryKey: ["sidebarServers"],
    queryFn: () => fetch("/api/subConfetti").then((res) => res.json()),
    staleTime: 60 * 1000,
  });

  const navItems = [
    {
      title: "Websites",
      url: "#",
      icon: "Globe",
      items: data?.subConfettiChannels.map(
        (subConfettiChannel: subConfettiChannel) => ({
          title: subConfettiChannel.name,
          url: `/s/${subConfettiChannel.id}`,
        }),
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-2xl text-white">
        error occured while fetching the data
      </div>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export const AppSidebarSkeleton = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={[]} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
