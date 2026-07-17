import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="সাবস্ক্রাইবার"
      description="প্ল্যাটফর্ম সাবস্ক্রাইবার এবং তাদের সাবস্ক্রিপশন স্ট্যাটাস পরিচালনা করুন।"
      cards={[
        {
          label: "মোট সাবস্ক্রাইবার",
          value: "0",
          description: "সক্রিয় সাবস্ক্রাইবার।",
        },
        {
          label: "এই মাসে নতুন",
          value: "0",
          description: "এই মাসে যোগ দেওয়া সাবস্ক্রাইবার।",
        },
      ]}
    />
  );
}
