"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { cn } from "@/lib/utils";

import { PublicMobileDrawer } from "./public-mobile-drawer";

const desktopLinks = [
  { label: "Home", href: "/" },
  { label: "Land Tools", href: "/tools" },
  { label: "Find Surveyor", href: "/surveyors" },
  { label: "Post a Request", href: "/post-request" },
  { label: "Pricing", href: "/pricing" },
];

export function PublicHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
        {/* Left: Logo */}
        <div className="flex-1">
          <Logo />
        </div>

        {/* Center: Nav */}
        <nav
          className="hidden items-center gap-5 lg:flex"
          aria-label="Primary navigation"
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
          <Button
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/surveyors" />}
          >
            Find a Surveyor
          </Button>
          <PublicMobileDrawer />
        </div>
      </div>
    </header>
  );
}
