"use client";

import { Bell, UserRound } from "lucide-react";

import type { NavigationItem } from "@/components/navigation/navigation-config";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { MobileDrawer } from "./mobile-drawer";

interface DashboardHeaderProps {
 title: string;
 label: string;
 navigation: NavigationItem[];
 mobileOpen: boolean;
 onMobileOpenChange: (open: boolean) => void;
}

export function DashboardHeader({ title, label, navigation, mobileOpen, onMobileOpenChange }: DashboardHeaderProps) {
 return (
 <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-sidebar px-4 sm:px-6">
 <MobileDrawer
 open={mobileOpen}
 onOpenChange={onMobileOpenChange}
 label={label}
 navigation={navigation}
 />
 <div>
 <p className="text-sm font-medium">{title}</p>
 <p className="text-xs text-muted-foreground">মৌজা ম্যাপ প্রো</p>
 </div>
 <div className="ml-auto flex items-center gap-1">
 <Button variant="ghost" size="icon" aria-label="নোটিফিকেশন">
 <Bell />
 </Button>
 <ThemeToggle />
 <Button variant="ghost" size="icon" aria-label="প্রোফাইল মেনু">
 <UserRound />
 </Button>
 </div>
 </header>
 );
}
