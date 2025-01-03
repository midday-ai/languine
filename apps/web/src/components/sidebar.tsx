"use client";

import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BarChart3, Languages, Settings } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo-square";

const navigation = [
  {
    icon: BarChart3,
    url: "/",
    isActive: true,
  },
  {
    icon: Languages,
    url: "/translations",
  },
  {
    icon: Settings,
    url: "/settings",
  },
];

export function Sidebar() {
  return (
    <SidebarBase>
      <SidebarHeader className="flex justify-center items-center h-[70px] border-b">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={cn("[&>svg]:size-5 size-[53px]", {
                      "opacity-50": !item.isActive,
                    })}
                  >
                    <Link href={item.url} prefetch>
                      <item.icon />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </SidebarBase>
  );
}
