"use client";

import { Calculator, Home, MapPin, Menu, Ruler } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileDrawer } from "@/components/layout/navbar/mobile-drawer";
import { cn } from "@/lib/utils";
import type { TAuthUser } from "@/interface/auth";

export function MobileBottomNav({ user }: { user?: TAuthUser }) {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isSurveyorsActive = pathname.startsWith("/surveyors");
  const isToolsActive = pathname.startsWith("/tools");
  const isCalculationsActive = pathname.startsWith("/calculations");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t bg-background/95 backdrop-blur-md px-2 lg:hidden select-none"
      aria-label="মোবাইল দ্রুত নেভিগেশন"
    >
      {/* 1. Home (Left) */}
      <Link
        href="/"
        aria-current={isHomeActive ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-0.5 transition-colors",
          isHomeActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="flex size-7 items-center justify-center">
          <Home className="size-5" aria-hidden />
        </span>
        <span className="text-[11px] leading-none">হোম</span>
      </Link>

      {/* 2. Surveyors (Left-Center) */}
      <Link
        href="/surveyors"
        aria-current={isSurveyorsActive ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-0.5 transition-colors",
          isSurveyorsActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="flex size-7 items-center justify-center">
          <MapPin className="size-5" aria-hidden />
        </span>
        <span className="text-[11px] leading-none">সার্ভেয়ার</span>
      </Link>

      {/* 3. Land Tools (Center - Elevated Floating Button) */}
      <Link
        href="/tools/land-measurement"
        aria-current={isToolsActive ? "page" : undefined}
        className="flex flex-1 flex-col items-center -mt-5 group"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 border-[3px] border-background ring-1 ring-primary/20 transition-transform group-active:scale-95">
          <Ruler className="size-6" aria-hidden />
        </span>
        <span
          className={cn(
            "text-[11px] mt-1 leading-none font-medium transition-colors",
            isToolsActive ? "text-primary" : "text-foreground",
          )}
        >
          ল্যান্ড টুলস
        </span>
      </Link>

      {/* 4. Calculations (Right-Center) */}
      <Link
        href="/calculations"
        aria-current={isCalculationsActive ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-0.5 transition-colors",
          isCalculationsActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="flex size-7 items-center justify-center">
          <Calculator className="size-5" aria-hidden />
        </span>
        <span className="text-[11px] leading-none">হিসাব</span>
      </Link>

      {/* 5. Menu (Right - Drawer Trigger) */}
      <div className="flex flex-1 justify-center">
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
              <span className="text-[11px] leading-none">মেনু</span>
            </button>
          }
        />
      </div>
    </nav>
  );
}
