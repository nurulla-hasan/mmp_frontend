import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="সংরক্ষিত ক্যালকুলেশন" description="সংরক্ষিত জমি পরিমাপ, ভাগ ও রূপান্তর পর্যালোচনা করুন।" cards={[{ label: "ক্যালকুলেশন ইতিহাস", value: "0", description: "সংরক্ষিত ক্যালকুলেশন এখানে দেখাবে।" },
        { label: "টুলস খুলুন", href: "/tools", description: "নতুন জমি ক্যালকুলেশন তৈরি করুন।" }]} />; }
