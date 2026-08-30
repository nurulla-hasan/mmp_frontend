"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  publicNavigation,
  surveyorNavigation,
  userNavigation,
} from "@/constants/nav-links";
import { logoutAction } from "@/app/(auth)/_actions/auth.action";
import type { TAuthUser } from "@/interface/auth";

const mobileLinks = publicNavigation;
const userMobileLinks = userNavigation;
const surveyorMobileLinks = surveyorNavigation;

export function MobileDrawer({
  isAuthenticated,
  userRole,
  customTrigger,
}: {
  isAuthenticated?: boolean;
  userRole?: TAuthUser["role"];
  customTrigger?: React.ReactElement;
}) {
  const pathname = usePathname();
  const dashboardLinks =
    userRole === "SURVEYOR"
      ? surveyorMobileLinks
      : userMobileLinks;

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
            >
              <Menu />
            </Button>
          )
        }
      />
      <DrawerContent>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Logo showText showTextOnMobile />
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="মেনু বন্ধ করুন"
              >
                <X />
              </Button>
            }
          />
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
                    <span>{item.title}</span>
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
              <div className="grid gap-1 max-h-48 overflow-y-auto">
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
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  );
                })}
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => logoutAction()}
                >
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
