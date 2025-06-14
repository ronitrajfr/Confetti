import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./add-toggle";

const Header = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
      </div>
      <div className="mr-4 ml-auto">
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
