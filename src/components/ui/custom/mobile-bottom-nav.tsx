"use client";

import { Calculator, Home, MapPin, PlusCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Post", icon: PlusCircle, href: "/post-request" },
  { label: "Tools", icon: Calculator, href: "/tools", center: true },
  { label: "Surveyors", icon: MapPin, href: "/surveyors" },
  { label: "Profile", icon: User, href: "/dashboard/profile" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-between border-t bg-background px-4 md:hidden" aria-label="Mobile quick navigation">
      {items.map(({ label, icon: Icon, href, center }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-w-12 flex-col items-center text-[10px] text-muted-foreground", active && "text-primary", center && "-translate-y-2 gap-1")}>
            <span className={cn("flex size-7 items-center justify-center rounded-full", center && "size-10 bg-primary text-primary-foreground ring-4 ring-background")}>
              <Icon className={cn("size-4", center && "size-5")} aria-hidden />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
