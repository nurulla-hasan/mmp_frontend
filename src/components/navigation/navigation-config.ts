import {
  Calculator,
  CircleUserRound,
  CreditCard,
  House,
  Megaphone,
  MonitorSmartphone,
  ShieldCheck,
  ShieldUser,
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
    title: "ওভারভিউ",
    href: "/admin/dashboard",
    icon: House,
  },
  {
    title: "ইউজার",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "সাবস্ক্রাইবার",
    href: "/admin/subscribers",
    icon: UserRoundCheck,
  },
  {
    title: "প্ল্যান",
    href: "/admin/plans",
    icon: Tags,
  },
  {
    title: "ডিভাইস ম্যানেজমেন্ট",
    href: "/admin/device-locks",
    icon: MonitorSmartphone,
  },
  {
    title: "ক্যালকুলেশন",
    href: "/admin/calculations",
    icon: Calculator,
  },
  {
    title: "পেমেন্ট",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "ব্রডকাস্ট",
    href: "/admin/broadcast",
    icon: Megaphone,
  },
  {
    title: "অ্যাডমিন ম্যানেজমেন্ট",
    href: "/admin/admins",
    icon: ShieldUser,
  },
  {
    title: "ভেরিফিকেশন রিকোয়েস্ট",
    href: "/admin/verifications",
    icon: ShieldCheck,
  },
  {
    title: "সার্ভিস ক্যাটাগরি",
    href: "/admin/service-categories",
    icon: Wrench,
  },
];
