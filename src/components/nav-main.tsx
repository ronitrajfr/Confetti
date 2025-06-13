"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import React from "react";
import { SidebarGroup, SidebarMenuItem } from "~/components/ui/sidebar";
import SubConfettiModal from "./subConfetti-modal";
import Link from "next/link";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    image: string | null;
  }[];
}

export const NavMain = React.memo(function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup className="flex flex-col gap-1 px-2">
      {items.map((item) => (
        <SidebarMenuItem key={item.url} className="group relative">
          <Link
            href={item.url}
            className="hover:bg-muted flex items-center justify-between gap-2 rounded px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2 truncate">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="bg-muted h-6 w-6 rounded-full" />
              )}
              <span className="truncate">r/{item.title}</span>
            </div>
            <Star className="text-muted-foreground h-4 w-4 opacity-60 transition group-hover:opacity-100" />
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarGroup>
  );
});
