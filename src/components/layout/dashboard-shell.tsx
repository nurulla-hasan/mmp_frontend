"use client";

import { useState } from "react";

import { adminNavigation, surveyorNavigation, userNavigation, type NavigationItem } from "@/components/navigation/navigation-config";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardRole = "user" | "surveyor" | "admin";

const roleConfig: Record<DashboardRole, { title: string; label: string; navigation: NavigationItem[] }> = {
  user: { title: "My Dashboard", label: "General User", navigation: userNavigation },
  surveyor: { title: "Surveyor Workspace", label: "Surveyor", navigation: surveyorNavigation },
  admin: { title: "Administration", label: "Admin", navigation: adminNavigation },
};

export function DashboardShell({ role, children }: { role: DashboardRole; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const config = roleConfig[role];
  return (
    <div className="min-h-screen bg-muted/30">
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
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
