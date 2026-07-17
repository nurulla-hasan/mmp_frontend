import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="প্রোফাইল" description="আপনার অ্যাকাউন্ট আইডেন্টিটি এবং যোগাযোগ পছন্দ পরিচালনা করুন।" cards={[{ label: "প্রোফাইল স্ট্যাটাস", value: "প্লেসহোল্ডার", description: "ব্যক্তিগত বিবরণ পরবর্তীতে সংযুক্ত হবে।" },
        { label: "অ্যাকাউন্ট সেটিংস", description: "নিরাপত্তা ও নোটিফিকেশন পছন্দ এখানে দেখাবে।" }]} />; }
