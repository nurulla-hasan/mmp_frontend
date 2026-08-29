"use client";

import { Home, MapPin, User, Menu, Ruler } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileDrawer } from "@/components/layout/navbar/mobile-drawer";

import { cn } from "@/lib/utils";

const items = [
  { label: "হোম", icon: Home, href: "/" },
  { label: "সার্ভেয়ার", icon: MapPin, href: "/surveyors" },
  { label: "টুলস", icon: Ruler, href: "/tools" },
  { label: "প্রোফাইল", icon: User, href: "/dashboard/profile" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-between border-t bg-background px-4 lg:hidden" aria-label="দ্রুত নেভিগেশন">
      {items.map(({ label, icon: Icon, href }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        const isSpecial = href === "/tools";
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center",
              isSpecial ? "gap-1" : "gap-0.5",
              active && !isSpecial ? "text-primary" : "text-muted-foreground",
            )}
          >
            {isSpecial ? (
              <span className="flex size-12 -mt-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 border-[3px] border-background ring-1 ring-primary/10">
                <Icon className="size-6" aria-hidden />
              </span>
            ) : (
              <span className="flex size-7 items-center justify-center">
                <Icon className="size-5" aria-hidden />
              </span>
            )}
            <span className={cn("text-xs leading-none", isSpecial && "font-medium")}>{label}</span>
          </Link>
        );
      })}
      
      {/* Menu Item (Drawer Trigger) */}
      <MobileDrawer
        isAuthenticated={true}
        customTrigger={
          <button
            className="flex flex-col items-center gap-0.5 text-muted-foreground"
            aria-label="মেনু"
          >
            <span className="flex size-7 items-center justify-center">
              <Menu className="size-5" aria-hidden />
            </span>
            <span className="text-xs leading-none">মেনু</span>
          </button>
        }
      />
    </nav>
  );
}
