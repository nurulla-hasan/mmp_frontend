import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="সার্ভেয়ার ড্যাশবোর্ড" description="আপনার পেশাদার কাজের ওভারভিউ।" cards={[{ label: "সক্রিয় জব", value: "0", href: "/surveyor/jobs", description: "নির্বাচিত এবং চলমান কাজ ট্র্যাক করুন।" }]} />; }
