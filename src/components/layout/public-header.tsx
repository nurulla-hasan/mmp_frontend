"use client";

import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";

import { PublicMobileDrawer } from "./public-mobile-drawer";

const desktopLinks = [
  { label: "Home", href: "/" },
  { label: "Land Tools", href: "/tools" },
  { label: "Find Surveyor", href: "/surveyors" },
  { label: "Post a Request", href: "/post-request" },
  { label: "Pricing", href: "/pricing" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav
          className="ml-auto hidden items-center gap-5 lg:flex"
          aria-label="Primary navigation"
        >
          {desktopLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Login
          </Button>
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
