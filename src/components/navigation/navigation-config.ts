

import {
  BadgeCheck,
  Calculator,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  HandCoins,
  House,
  MapPin,
  Megaphone,
  MessageSquare,
  MonitorSmartphone,
  ShieldCheck,
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
    title: "Overview",
    href: "/dashboard",
    icon: House,
  },
  {
    title: "My Calculations",
    href: "/dashboard/calculations",
    icon: Calculator,
  },
  {
    title: "Service Requests",
    href: "/dashboard/service-requests",
    icon: ClipboardList,
  },
  {
    title: "Quotations",
    href: "/dashboard/quotations",
    icon: HandCoins,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: CircleUserRound,
  },
];

export const surveyorNavigation: NavigationItem[] = [
  {
    title: "Overview",
    href: "/surveyor/dashboard",
    icon: House,
  },
  {
    title: "My Calculations",
    href: "/surveyor/calculations",
    icon: Calculator,
  },
  {
    title: "Public Profile",
    href: "/surveyor/profile",
    icon: CircleUserRound,
  },
  {
    title: "Verification",
    href: "/surveyor/verification",
    icon: BadgeCheck,
  },
  {
    title: "My Services",
    href: "/surveyor/services",
    icon: Wrench,
  },
  {
    title: "Service Areas",
    href: "/surveyor/service-areas",
    icon: MapPin,
  },
  {
    title: "Available Requests",
    href: "/surveyor/requests",
    icon: ClipboardList,
  },
  {
    title: "Quotations",
    href: "/surveyor/quotations",
    icon: HandCoins,
  },
  {
    title: "Messages",
    href: "/surveyor/messages",
    icon: MessageSquare,
  },
];

export const adminNavigation: NavigationItem[] = [
  {
    title: "Overview",
    href: "/admin/dashboard",
    icon: House,
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
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Broadcast",
    href: "/admin/broadcast",
    icon: Megaphone,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Verification Requests",
    href: "/admin/verifications",
    icon: ShieldCheck,
  },
  {
    title: "Service Categories",
    href: "/admin/service-categories",
    icon: Wrench,
  },
];


