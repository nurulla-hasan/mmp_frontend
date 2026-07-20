"use client";

import { FileText, Home, MapPin, Menu, Ruler, Tag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { label: "হোম", href: "/", icon: Home },
  { label: "ল্যান্ড টুলস", href: "/tools", icon: Ruler },
  { label: "সার্ভেয়ার খুঁজুন", href: "/surveyors", icon: MapPin },
  { label: "সার্ভেয়ার খুঁজুন", href: "/surveyors", icon: FileText },
  { label: "প্রাইসিং", href: "/pricing", icon: Tag },
];

export function PublicMobileDrawer() {
  const pathname = usePathname();

  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="মেনু খুলুন"
          />
        }
      >
        <Menu />
      </DrawerTrigger>
      <DrawerContent>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Logo />
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="মেনু বন্ধ করুন"
              />
            }
          >
            <X />
          </DrawerClose>
        </div>

        {/* Navigation Links */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="মোবাইল নেভিগেশন"
        >
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            মেনু
          </p>
          {mobileLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <DrawerClose
                key={item.href}
                nativeButton={false}
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isActive && "text-primary",
                      )}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto size-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                }
              />
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t p-4">
          <p className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            Account
          </p>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              <DrawerClose
                nativeButton={false}
                render={
                  <Button
                    className="w-full"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    Login
                  </Button>
                }
              />
              <DrawerClose
                nativeButton={false}
                render={
                  <Button
                    className="w-full"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/register" />}
                  >
                    Register
                  </Button>
                }
              />
            </div>
            <p className="px-1 text-xs text-muted-foreground/60 text-center">
              After registering, you can apply to become a surveyor from your
              dashboard.
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
