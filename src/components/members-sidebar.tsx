"use client";

import * as React from "react";
import { Search, Wifi, Volume2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";

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
    <div className="group">
      <button className="flex w-full items-center rounded-md p-2 hover:bg-gray-800/50">
        <div className="relative">
          <Avatar className="h-8 w-8 border border-[#373737]">
            <AvatarImage
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
            />
            <AvatarFallback className="text-xs text-zinc-400">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 pl-4">
          <div className="truncate text-sm font-medium text-zinc-100">
            {user.name}
          </div>
        </div>
      </button>
    </div>
  );
}

export function DiscordSidebar({ channelId }: { channelId: string }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
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
        id: Number.parseInt(member.user.id),
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

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Desktop sidebar
  const DesktopSidebar = (
    <div className="bg-sidebar fixed top-0 right-0 mt-16 hidden h-[calc(100vh-4rem)] w-60 border-l border-gray-800 md:block">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-2 py-4">
          {isLoading && (
            <div className="px-2 text-sm text-gray-400">Loading members...</div>
          )}
          {isError && (
            <div className="px-2 text-sm text-red-500">Failed to load data</div>
          )}

          {!isLoading &&
            !isError &&
            groupedUsers.map((group) => (
              <div key={group.title} className="mb-4">
                <h3 className="mb-2 px-2 text-xs font-semibold tracking-wide text-gray-200 uppercase">
                  {group.title} — {group.count}
                </h3>
                <div className="space-y-1">
                  {group.users.map((user) => (
                    <UserItem key={user.id} user={user} />
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="border-t border-gray-600 p-4">
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
        </div>
      </div>
    </div>
  );

  // Mobile search button
  const MobileSearchButton = (
    <div className="fixed top-18 right-4 z-20 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="bg-sidebar h-10 w-10 rounded-md border border-[#373737] text-white hover:bg-gray-700"
        onClick={toggleMobileSidebar}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Open members sidebar</span>
      </Button>
    </div>
  );

  // Mobile sidebar overlay
  const MobileSidebar = isMobileSidebarOpen && (
    <div className="bg-sidebar fixed inset-0 z-50 md:hidden">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-white">Members</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white"
            onClick={toggleMobileSidebar}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="text-sm text-gray-400">Loading members...</div>
          )}
          {isError && (
            <div className="text-sm text-red-500">Failed to load data</div>
          )}

          {!isLoading &&
            !isError &&
            groupedUsers.map((group) => (
              <div key={group.title} className="mb-6">
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  {group.title} — {group.count}
                </h3>
                <div className="space-y-1">
                  {group.users.map((user) => (
                    <UserItem key={user.id} user={user} />
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="border-t border-gray-600 p-4">
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
        </div>
      </div>
    </div>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileSearchButton}
      {MobileSidebar}
    </>
  );
}
