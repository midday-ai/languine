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
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  MdGraphicEq,
  MdOutlineSettings,
  MdOutlineStackedBarChart,
  MdPeopleOutline,
  MdTranslate,
} from "react-icons/md";
import { Logo } from "./logo-square";

export function Sidebar() {
  const params = useParams();
  const pathname = usePathname();

  const navigation = [
    {
      icon: MdOutlineStackedBarChart,
      path: "/",
      isActive: pathname === `/${params.organization}`,
    },
    {
      icon: MdGraphicEq,
      path: "/tuning",
      isActive: pathname.endsWith("/tuning"),
    },
    {
      icon: MdTranslate,
      path: "/glossary",
      isActive: pathname.endsWith("/glossary"),
    },
    {
      icon: MdPeopleOutline,
      path: "/team",
      isActive: pathname.endsWith("/team"),
    },
    {
      icon: MdOutlineSettings,
      path: "/settings",
      isActive: pathname.endsWith("/settings"),
    },
  ];

  return (
    <div className="sticky top-0 h-screen">
      <SidebarBase collapsible="none" className="border-r border-border">
        <SidebarHeader className="flex justify-center items-center h-[70px] border-b">
          <Link href={`/${params.organization}`}>
            <Logo />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="p-0">
              <SidebarMenu className="divide-y divide-border">
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      className={cn("[&>svg]:size-5 size-[70px]", {
                        "opacity-50": !item.isActive,
                      })}
                    >
                      <Link
                        href={`/${params.organization}${item.path}`}
                        prefetch
                      >
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
    </div>
  );
}
