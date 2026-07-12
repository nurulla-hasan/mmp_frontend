"use client";

import { Bell, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/shared/logo";
import { adminNavigation, surveyorNavigation, userNavigation, type NavigationItem } from "@/components/navigation/navigation-config";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { cn } from "@/lib/utils";

type DashboardRole = "user" | "surveyor" | "admin";

const roleConfig: Record<DashboardRole, { title: string; label: string; navigation: NavigationItem[] }> = {
  user: { title: "My Dashboard", label: "General User", navigation: userNavigation },
  surveyor: { title: "Surveyor Workspace", label: "Surveyor", navigation: surveyorNavigation },
  admin: { title: "Administration", label: "Admin", navigation: adminNavigation },
};

function isRouteActive(pathname: string, href: string) {
  const isOverview = href === "/dashboard" || href === "/surveyor/dashboard" || href === "/admin/dashboard";
  return isOverview ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavigation({ items, onNavigate }: { items: NavigationItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1" aria-label="Dashboard navigation">
      {items.map((item) => {
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
              active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ role, children }: { role: DashboardRole; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = roleConfig[role];
  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar p-4 lg:block">
        <Logo className="px-2" />
        <p className="mb-6 mt-3 px-2 text-xs text-muted-foreground">{config.label}</p>
        <SidebarNavigation items={config.navigation} />
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger render={<Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation" />}>
              <Menu />
            </DialogTrigger>
            <DialogContent className="left-0 top-0 h-dvh max-w-72 translate-x-0 translate-y-0 rounded-none p-4" showCloseButton>
              <DialogTitle className="sr-only">Dashboard navigation</DialogTitle>
              <DialogDescription className="sr-only">Navigate through the {config.label.toLowerCase()} dashboard.</DialogDescription>
              <Logo />
              <div className="mt-6 overflow-y-auto">
                <SidebarNavigation items={config.navigation} onNavigate={() => setMobileOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
          <div>
            <p className="text-sm font-medium">{config.title}</p>
            <p className="text-xs text-muted-foreground">Mouza Map Pro</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Notifications"><Bell /></Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Profile menu"><UserRound /></Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
