"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { SidebarGroup, SidebarMenuItem } from "~/components/ui/sidebar";
import SubConfettiModal from "./subConfetti-modal";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    image: string | null;
  }[];
}

export function NavMain({ items }: NavMainProps) {
  console.log(items);
  return (
    <SidebarGroup className="flex flex-col gap-1 px-2">
      <SubConfettiModal />
      {items.map((item) => (
        <SidebarMenuItem key={item.url} className="group relative">
          <a
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
          </a>
        </SidebarMenuItem>
      ))}
    </SidebarGroup>
  );
}
