import {
  Calculator,
  FileText,
  Home,
  House,
  Info,
  MapPin,
  Megaphone,
  MonitorSmartphone,
  PhoneCall,
  Ruler,
  ShieldCheck,
  ShieldUser,
  Star,
  Tags,
  UserPlus,
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
  { title: "আমাদের সম্পর্কে", href: "/about", icon: Info },
  { title: "যোগাযোগ", href: "/contact", icon: PhoneCall },
];

export const userNavigation: NavigationItem[] = [
  {
    title: "ক্যালকুলেশন",
    href: "/calculations",
    icon: Calculator,
  },
  {
    title: "প্রোফাইল",
    href: "/dashboard/profile",
    icon: FileText,
  },
  {
    title: "সার্ভেয়ার হিসেবে যোগ দিন",
    href: "/join-as-surveyor",
    icon: UserPlus,
  },
];

export const surveyorNavigation: NavigationItem[] = [
  {
    title: "ক্যালকুলেশন",
    href: "/calculations",
    icon: Calculator,
  },

  {
    title: "প্রোফাইল",
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
    title: "Services",
    href: "/admin/services",
    icon: Wrench,
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
];
