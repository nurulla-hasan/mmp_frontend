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
  { label: "প্রাইসিং", href: "/pricing", icon: Tag },
];

const userMobileLinks = [
  { label: "ড্যাশবোর্ড", href: "/dashboard", icon: Home },
  { label: "ক্যালকুলেশন", href: "/dashboard/calculations", icon: Ruler },
  { label: "প্রোফাইল", href: "/dashboard/profile", icon: FileText },
];

const surveyorMobileLinks = [
  { label: "ড্যাশবোর্ড", href: "/surveyor/dashboard", icon: Home },
  { label: "ক্যালকুলেশন", href: "/surveyor/calculations", icon: Ruler },
  { label: "প্রোফাইল", href: "/surveyor/profile", icon: FileText },
];

export function PublicMobileDrawer({
  isAuthenticated,
  userRole,
  customTrigger,
}: {
  isAuthenticated?: boolean;
  userRole?: "USER" | "SURVEYOR" | "ADMIN";
  customTrigger?: React.ReactElement;
}) {
  const pathname = usePathname();
  const isSurveyor = userRole === "SURVEYOR";
  const dashboardLinks = isSurveyor ? surveyorMobileLinks : userMobileLinks;

  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger
        render={
          customTrigger ? (
            customTrigger
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              aria-label="মেনু খুলুন"
            />
          )
        }
      >
        {!customTrigger && <Menu />}
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
          {isAuthenticated ? (
            <>
              <p className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                ড্যাশবোর্ড
              </p>
              <div className="grid gap-1">
                {dashboardLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
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
                          <Icon className="size-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  );
                })}
              </div>
              <div className="mt-3">
                <Button variant="outline" className="w-full">
                  লগআউট
                </Button>
              </div>
            </>
          ) : (
            <>
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
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
