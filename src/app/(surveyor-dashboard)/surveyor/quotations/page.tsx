import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="কোটেশন" description="ক্লায়েন্ট কোটেশন তৈরি এবং ট্র্যাক করুন।" cards={[{ label: "খসড়া কোটেশন", value: "0", description: "পাঠানো হয়নি এমন কোটেশন এখানে দেখাবে।" },{ label: "উত্তরের অপেক্ষায়", value: "0", description: "জমা দেওয়া কোটেশন এখানে দেখাবে।" }]} />; }
