"use client";

import * as React from "react";
import { Search, Wifi, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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

export const userGroups: UserGroup[] = [
  {
    title: "Owner",
    count: 1,
    users: [
      {
        id: 1,
        name: "webofayush",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
    ],
  },
  {
    title: "Server Manager",
    count: 1,
    users: [
      {
        id: 2,
        name: "snoww.",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
    ],
  },
  {
    title: "Developers",
    count: 20,
    users: [
      {
        id: 3,
        name: "Aditya vegas",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 4,
        name: "Amit",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 5,
        name: "Aris",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
        activity: "professional YouTube watcher",
      },
      {
        id: 6,
        name: "CoffeeBoi",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
        activity: "Playing Microsoft Visual S...",
      },
      {
        id: 7,
        name: "cr4ck.j4ck",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 8,
        name: "CRIMINAL 69",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
        activity: "EHH SHTY JA JAKE CARDIO ...",
      },
      {
        id: 9,
        name: "DESGRACIADO",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 10,
        name: "dharampal",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 11,
        name: "GHOST",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 12,
        name: "Kekeu",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 13,
        name: "Meetraj Raulji",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 14,
        name: "Nirbhay",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
      {
        id: 15,
        name: "Noxx",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
      },
    ],
  },
];

function UserItem({ user }: any) {
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
            <div
              className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 ${getStatusColor(user.status)} rounded-full border-2 border-black`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">
              {user.name}
            </div>
            {user.activity && (
              <div className="truncate text-xs text-gray-400">
                {user.activity}
              </div>
            )}
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function DiscordSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredGroups = userGroups
    .map((group) => ({
      ...group,
      users: group.users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((group) => group.users.length > 0);

  return (
    <Sidebar
      side="right"
      className="mt-16 w-60 border-l border-gray-800 bg-black"
    >
      <SidebarHeader className="p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <SidebarInput
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-600 bg-gray-900 pl-10 text-white placeholder-gray-500 focus:border-gray-400"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {filteredGroups.map((group, index) => (
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
            <span>11:56 AM</span>
          </div>
          <span>6/12/2025</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
