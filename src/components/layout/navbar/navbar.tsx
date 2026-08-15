"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthDropdown } from "@/components/auth/auth-dropdown";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { cn } from "@/lib/utils";

import { CONTAINER_MAX_WIDTH } from "@/components/common/page-wrapper";
import { MobileDrawer } from "./mobile-drawer";

const desktopLinks = [
  { label: "হোম", href: "/" },
  { label: "ল্যান্ড টুলস", href: "/tools" },
  { label: "সার্ভেয়ার খুঁজুন", href: "/surveyors" },
  // { label: "প্রাইসিং", href: "/pricing" },
];

export function Navbar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 bg-sidebar shadow-sm">
      <div
        className={cn(
          `mx-auto flex h-16 w-full ${CONTAINER_MAX_WIDTH} items-center px-4 sm:px-6`,
        )}
      >
        {/* Left: Logo */}
        <div className="flex flex-1 items-center gap-2">
          <div className="lg:hidden flex items-center">
            <Logo showText={true} size="sm" />
          </div>
          <div className="hidden lg:flex items-center">
            <Logo showText={true} size="md" />
          </div>
        </div>

        {/* Center: Nav */}
        <nav
          className="hidden items-center gap-5 lg:flex"
          aria-label="প্রধান নেভিগেশন"
        >
          {desktopLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                isActive(item.href)
                  ? "font-medium text-foreground border-b-2 border-primary"
                  : "text-muted-foreground border-b-2 border-transparent",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          <div className="hidden lg:block">
            <AuthDropdown isAuthenticated={true} />
          </div>
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
