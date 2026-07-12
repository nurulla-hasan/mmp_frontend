"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import type { NavigationItem } from "@/components/navigation/navigation-config";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Button } from "../ui/button";

function isRouteActive(pathname: string, href: string) {
  const isOverview =
    href === "/dashboard" ||
    href === "/surveyor/dashboard" ||
    href === "/admin/dashboard";
  return isOverview
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

interface DashboardSidebarProps {
  label: string;
  navigation: NavigationItem[];
  onNavigate?: () => void;
  showLogout?: boolean;
}

export function DashboardSidebar({
  label,
  navigation,
  onNavigate,
  showLogout = true,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="h-16 p-4 border-b">
        <Logo className="px-2" />
        {/* <p className="mb-6 mt-3 px-2 text-xs text-muted-foreground">{label}</p> */}
      </div>
      <ScrollArea className="flex-1 p-2 overflow-y-auto">
        <nav
          className="space-y-1 mt-4"
          aria-label="Dashboard navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {showLogout && (
        <div className="border-t h-16 flex justify-center items-center">
          <Button variant="ghost" className="w-full">
            <LogOut />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
