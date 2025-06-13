"use client";

import * as React from "react";
import { Search, Wifi, Volume2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    username: string;
  };
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
  activity?: string;
}

export interface UserGroup {
  title: string;
  count: number;
  users: User[];
}

function useMembers(channelId: string) {
  return useQuery({
    queryKey: ["members", channelId],
    queryFn: async () => {
      const res = await fetch(`/api/members?id=${channelId}`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      return data.members as Member[];
    },
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}

function UserItem({ user }: { user: User }) {
  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="h-auto p-2 hover:bg-gray-800/50">
        <div className="flex w-full items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
              />
              <AvatarFallback className="bg-gray-700 text-xs text-zinc-900">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">
              {user.name}
            </div>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function DiscordSidebar({ channelId }: { channelId: string }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { data: members, isLoading, isError } = useMembers(channelId);

  const groupedUsers: UserGroup[] = React.useMemo(() => {
    if (!members) return [];

    const groups: Record<string, UserGroup> = {};

    for (const member of members) {
      const role = member.role || "Unknown";
      const roleDisplay = role
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

      if (!groups[roleDisplay]) {
        groups[roleDisplay] = {
          title: roleDisplay,
          count: 0,
          users: [],
        };
      }

      groups[roleDisplay].users.push({
        id: parseInt(member.user.id),
        name: member.user.username,
        avatar: "/placeholder.svg",
        status: "online", // Can update this with real-time presence
      });
      groups[roleDisplay].count++;
    }

    return Object.values(groups)
      .map((group) => ({
        ...group,
        users: group.users.filter((user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((group) => group.users.length > 0);
  }, [members, searchQuery]);

  return (
    <Sidebar
      side="right"
      className="mt-16 w-60 border-l border-gray-800 bg-black"
    >
      <SidebarContent className="px-2">
        {isLoading && (
          <div className="px-2 text-sm text-gray-400">Loading members...</div>
        )}
        {isError && (
          <div className="px-2 text-sm text-red-500">Failed to load data</div>
        )}

        {!isLoading &&
          !isError &&
          groupedUsers.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel className="mt-4 mb-2 px-2 text-xs font-semibold tracking-wide text-gray-400 uppercase first:mt-0">
                {group.title} — {group.count}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.users.map((user) => (
                    <UserItem key={user.id} user={user} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-600 p-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            <span>ENG</span>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <span>
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
