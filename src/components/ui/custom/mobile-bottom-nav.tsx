"use client";

import { Calculator, Home, MapPin, PlusCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Tools", icon: Calculator, href: "/tools" },
  { label: "Post", icon: PlusCircle, href: "/post-request", isCenter: true },
  { label: "Surveyors", icon: MapPin, href: "/surveyors" },
  { label: "Profile", icon: User, href: "/dashboard/profile" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-between border-t bg-background px-4 md:hidden" aria-label="Mobile quick navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-12 flex-col items-center gap-1 text-[10px] text-muted-foreground", active && "text-primary", item.isCenter && "-translate-y-2")}>
            <span className={cn("flex size-8 items-center justify-center rounded-full", item.isCenter && "size-12 bg-primary text-primary-foreground ring-4 ring-background")}>
              <Icon className={cn("size-5", item.isCenter && "size-6")} aria-hidden="true" />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
