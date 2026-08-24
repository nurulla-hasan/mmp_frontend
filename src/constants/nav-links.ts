import {
  Calculator,
  FileText,
  Home,
  House,
  MapPin,
  Megaphone,
  MonitorSmartphone,
  Ruler,
  ShieldCheck,
  ShieldUser,
  Star,
  Tags,
  UserRoundCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/** Public header / mobile drawer — shared single source of truth */
export const publicNavigation: NavigationItem[] = [
  { title: "হোম", href: "/", icon: Home },
  { title: "ল্যান্ড টুলস", href: "/tools", icon: Ruler },
  { title: "সার্ভেয়ার খুঁজুন", href: "/surveyors", icon: MapPin },
];

export const userNavigation: NavigationItem[] = [
  {
    title: "আমার ক্যালকুলেশন",
    href: "/calculations",
    icon: Calculator,
  },
  {
    title: "প্রোফাইল",
    href: "/dashboard/profile",
    icon: FileText,
  },
];

export const surveyorNavigation: NavigationItem[] = [

  {
    title: "আমার ক্যালকুলেশন",
    href: "/calculations",
    icon: Calculator,
  },

  {
    title: "পেশাদার প্রোফাইল",
    href: "/surveyor/profile",
    icon: FileText,
  },

];

export const adminNavigation: NavigationItem[] = [
  {
    title: "Overview",
    href: "/admin/dashboard",
    icon: House,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Subscribers",
    href: "/admin/subscribers",
    icon: UserRoundCheck,
  },
  {
    title: "Plans",
    href: "/admin/plans",
    icon: Tags,
  },
  {
    title: "Device Management",
    href: "/admin/device-locks",
    icon: MonitorSmartphone,
  },
  {
    title: "Calculations",
    href: "/admin/calculations",
    icon: Calculator,
  },
  {
    title: "Broadcast",
    href: "/admin/broadcast",
    icon: Megaphone,
  },
  {
    title: "Admin Management",
    href: "/admin/admins",
    icon: ShieldUser,
  },
  {
    title: "Verification Requests",
    href: "/admin/verifications",
    icon: ShieldCheck,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Service Categories",
    href: "/admin/service-categories",
    icon: Wrench,
  },
];
