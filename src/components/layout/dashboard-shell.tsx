"use client";

import { useState } from "react";

import { adminNavigation, surveyorNavigation, userNavigation, type NavigationItem } from "@/components/navigation/navigation-config";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { cn } from "@/lib/utils";
import { CONTAINER_MAX_WIDTH } from "../shared/page-wrapper";

type DashboardRole = "user" | "surveyor" | "admin";

const roleConfig: Record<DashboardRole, { title: string; label: string; navigation: NavigationItem[] }> = {
  user: { title: "আমার ড্যাশবোর্ড", label: "সাধারণ ইউজার", navigation: userNavigation },
  surveyor: { title: "সার্ভেয়ার ওয়ার্কস্পেস", label: "সার্ভেয়ার", navigation: surveyorNavigation },
  admin: { title: "অ্যাডমিন প্যানেল", label: "অ্যাডমিন", navigation: adminNavigation },
};

export function DashboardShell({ role, children }: { role: DashboardRole; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = roleConfig[role];
  return (
    <div className="min-h-dvh bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:flex lg:flex-col">
        <DashboardSidebar label={config.label} navigation={config.navigation} />
      </aside>
      <div className="lg:pl-64">
        <DashboardHeader
          title={config.title}
          label={config.label}
          navigation={config.navigation}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />
        <main className={cn(`mx-auto w-full ${CONTAINER_MAX_WIDTH} p-4 sm:p-6 lg:p-8`)}>{children}</main>
      </div>
    </div>
  );
}
