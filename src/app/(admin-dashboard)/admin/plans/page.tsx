import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="প্ল্যান"
      description="সাবস্ক্রিপশন প্ল্যান এবং প্রাইসিং টিয়ার কনফিগার করুন।"
      cards={[
        {
          label: "সক্রিয় প্ল্যান",
          value: "0",
          description: "বর্তমানে উপলব্ধ সাবস্ক্রিপশন প্ল্যান।",
        },
        {
          label: "মোট আয়",
          value: "৳০",
          description: "সমস্ত প্ল্যান থেকে আয়।",
        },
      ]}
    />
  );
}
