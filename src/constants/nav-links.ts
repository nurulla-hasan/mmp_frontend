import {
  Calculator,
  CircleUserRound,
  House,
  Megaphone,
  MonitorSmartphone,
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
  icon?: LucideIcon;
}

export const userNavigation: NavigationItem[] = [
  {
    title: "ওভারভিউ",
    href: "/dashboard",
    icon: House,
  },
  {
    title: "আমার ক্যালকুলেশন",
    href: "/dashboard/calculations",
    icon: Calculator,
  },
  {
    title: "প্রোফাইল",
    href: "/dashboard/profile",
    icon: CircleUserRound,
  },
];

export const surveyorNavigation: NavigationItem[] = [
  {
    title: "ওভারভিউ",
    href: "/surveyor/dashboard",
    icon: House,
  },
  {
    title: "আমার ক্যালকুলেশন",
    href: "/surveyor/calculations",
    icon: Calculator,
  },

  {
    title: "পেশাদার প্রোফাইল",
    href: "/surveyor/profile",
    icon: CircleUserRound,
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
