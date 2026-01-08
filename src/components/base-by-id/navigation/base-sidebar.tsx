"use client";

import { AvatarLogOutDropdown } from "@/components/dashboard/avatar-log-out-dropdown";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { User } from "@/types/users";
import { ArrowLeft, Bell, Ellipsis, HelpCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface props {
  user: User;
}

const bottomItems = [
  {
    id: "help",
    icon: HelpCircle,
    tooltip: "Help",
  },
  {
    id: "notifications",
    icon: Bell,
    tooltip: "Notifications",
  },
];

export function BaseSidebar({ user }: props) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent className="flex h-full flex-col justify-between bg-white">
        {/* Top Section */}
        <SidebarGroup className="pt-2">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col items-center gap-1">
              {/* Home / Back button */}
              <SidebarMenuItem className="list-none">
                <SidebarMenuButton
                  className="pointer h-8 w-8 justify-center p-0 hover:bg-transparent"
                  onMouseEnter={() => setHoveredItem("home")}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {hoveredItem === "home" ? (
                    <ArrowLeft
                      className="h-3 w-3"
                      onClick={() => router.push("/dashboard")}
                    />
                  ) : (
                    <Image
                      src="/airtable-black-icon.png"
                      alt="Airtable logo"
                      width={30}
                      height={30}
                      className="h-9 w-9"
                    />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="list-none">
                <SidebarMenuButton
                  className="pointer h-8 w-8 justify-center p-0 hover:bg-transparent"
                  onMouseEnter={() => setHoveredItem("ellipsis")}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {hoveredItem === "ellipsis" ? (
                    <Ellipsis className="h-3 w-3" />
                  ) : (
                    <Image
                      src="/omni-icon.png"
                      alt="Omni icon"
                      width={30}
                      height={30}
                      className="h-9 w-9"
                    />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Section */}
        <SidebarGroup className="pb-4">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col items-center gap-1">
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.id} className="list-none">
                  <SidebarMenuButton className="pointer h-8 w-8 justify-center rounded-full p-0 hover:bg-gray-100">
                    <item.icon className="h-4 w-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Avatar dropdown */}
              <SidebarMenuItem className="list-none">
                <AvatarLogOutDropdown user={user} align={"start"} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
