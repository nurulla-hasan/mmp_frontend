"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileDrawer } from "@/components/layout/navbar/mobile-drawer";
import { cn } from "@/lib/utils";
import type { TAuthUser } from "@/interface/auth";
import { publicNavigation } from "@/constants/nav-links";

export function MobileBottomNav({ user }: { user?: TAuthUser }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-between border-t bg-background/95 backdrop-blur-md px-4 lg:hidden select-none"
      aria-label="দ্রুত নেভিগেশন"
    >
      {publicNavigation.map(({ title, icon: Icon, href }) => {
        const active =
          pathname === href ||
          (href !== "/" && pathname.startsWith(`${href}/`));
        const isSpecial = href === "/tools";
        return (
          <Link
            key={title}
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
            <span
              className={cn("text-xs leading-none", isSpecial && "font-medium")}
            >
              {title}
            </span>
          </Link>
        );
      })}

      {/* Menu Item (Drawer Trigger) */}
      <MobileDrawer
        isAuthenticated={!!user}
        userRole={user?.role}
        customTrigger={
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
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
