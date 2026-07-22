"use client";

import { Home, MapPin, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { label: "হোম", icon: Home, href: "/" },
  { label: "সার্ভেয়ার", icon: MapPin, href: "/surveyors" },
  { label: "প্রোফাইল", icon: User, href: "/dashboard/profile" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t bg-background px-4 lg:hidden" aria-label="দ্রুত নেভিগেশন">
      {items.map(({ label, icon: Icon, href }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="flex size-7 items-center justify-center">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="text-[10px] leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
