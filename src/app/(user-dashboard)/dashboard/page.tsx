import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="ইউজার ড্যাশবোর্ড" description="আপনার জমি-সেবা কার্যক্রমের একটি সংক্ষিপ্ত বিবরণ।" cards={[{ label: "সক্রিয় রিকোয়েস্ট", value: "0", href: "/dashboard/service-requests", description: "জমা দেওয়া সার্ভিস রিকোয়েস্ট ট্র্যাক করুন।" }]} />; }
