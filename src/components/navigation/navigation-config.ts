"use client";

import {
  BadgeCheck, BriefcaseBusiness, CalendarDays, Calculator, CircleUserRound,
  ClipboardList, FileCheck2, FileText, HandCoins, House, Map, MapPin, MessageSquare,
  NotebookTabs, Settings, ShieldCheck, Star, Users, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const userNavigation: NavigationItem[] = [
  { title: "Overview", href: "/dashboard", icon: House },
  { title: "My Properties", href: "/dashboard/properties", icon: Map },
  { title: "Saved Calculations", href: "/dashboard/calculations", icon: Calculator },
  { title: "Service Requests", href: "/dashboard/service-requests", icon: ClipboardList },
  { title: "Quotations", href: "/dashboard/quotations", icon: HandCoins },
  { title: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { title: "Documents", href: "/dashboard/documents", icon: FileText },
  { title: "Survey Reports", href: "/dashboard/reports", icon: FileCheck2 },
  { title: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { title: "Reviews", href: "/dashboard/reviews", icon: Star },
  { title: "Profile", href: "/dashboard/profile", icon: CircleUserRound },
];

export const surveyorNavigation: NavigationItem[] = [
  { title: "Overview", href: "/surveyor/dashboard", icon: House },
  { title: "Public Profile", href: "/surveyor/profile", icon: CircleUserRound },
  { title: "Verification", href: "/surveyor/verification", icon: BadgeCheck },
  { title: "Services", href: "/surveyor/services", icon: Wrench },
  { title: "Service Areas", href: "/surveyor/service-areas", icon: MapPin },
  { title: "Available Requests", href: "/surveyor/requests", icon: ClipboardList },
  { title: "Quotations", href: "/surveyor/quotations", icon: HandCoins },
  { title: "Active Jobs", href: "/surveyor/jobs", icon: BriefcaseBusiness },
  { title: "Calendar", href: "/surveyor/calendar", icon: CalendarDays },
  { title: "Messages", href: "/surveyor/messages", icon: MessageSquare },
  { title: "Survey Reports", href: "/surveyor/reports", icon: FileCheck2 },
  { title: "Reviews", href: "/surveyor/reviews", icon: Star },
];

export const adminNavigation: NavigationItem[] = [
  { title: "Overview", href: "/admin/dashboard", icon: House },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Surveyors", href: "/admin/surveyors", icon: MapPin },
  { title: "Verification Requests", href: "/admin/verifications", icon: ShieldCheck },
  { title: "Services", href: "/admin/services", icon: Wrench },
  { title: "Service Requests", href: "/admin/service-requests", icon: ClipboardList },
  { title: "Jobs", href: "/admin/jobs", icon: BriefcaseBusiness },
  { title: "Survey Reports", href: "/admin/reports", icon: FileCheck2 },
  { title: "Reviews", href: "/admin/reviews", icon: Star },
  { title: "Community", href: "/admin/community", icon: MessageSquare },
  { title: "Service Guides", href: "/admin/guides", icon: NotebookTabs },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];
