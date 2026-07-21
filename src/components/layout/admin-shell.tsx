"use client";

import { useState } from "react";
import { Bell, LogOut, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminNavigation } from "@/components/navigation/navigation-config";
import { cn } from "@/lib/utils";
import { CONTAINER_MAX_WIDTH } from "@/components/ui/custom/page-wrapper";

function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Logo className="px-2" />
      </div>
      <ScrollArea className="flex-1 overflow-y-auto p-2">
        <nav className="mt-4 space-y-1" aria-label="অ্যাডমিন নেভিগেশন">
          {adminNavigation.map((item) => {
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
                    ? "bg-primary text-sidebar-primary-foreground"
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
      <div className="flex h-16 items-center justify-center border-t">
        <Button variant="ghost" className="w-full">
          <LogOut />
          লগআউট
        </Button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:flex lg:flex-col">
        <AdminSidebar />
      </aside>

      {/* Main Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-sidebar px-4 sm:px-6">
          {/* Mobile Drawer Trigger */}
          <Drawer
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            swipeDirection="left"
          >
            <DrawerTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="নেভিগেশন খুলুন"
                />
              }
            >
              <Menu />
            </DrawerTrigger>
            <DrawerContent>
              <DrawerTitle className="sr-only">অ্যাডমিন নেভিগেশন</DrawerTitle>
              <DrawerDescription className="sr-only">
                অ্যাডমিন ড্যাশবোর্ডে নেভিগেট করুন।
              </DrawerDescription>
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </DrawerContent>
          </Drawer>

          <div>
            <p className="text-sm font-medium">অ্যাডমিন প্যানেল</p>
            <p className="text-xs text-muted-foreground">মৌজা ম্যাপ প্রো</p>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="নোটিফিকেশন">
              <Bell />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="প্রোফাইল মেনু">
              <UserRound />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main
          className={cn(
            `mx-auto w-full ${CONTAINER_MAX_WIDTH} p-4 sm:p-6 lg:p-8`,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
