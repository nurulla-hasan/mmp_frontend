import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="ডিভাইস লক"
      description="Device-ভিত্তিক অ্যাক্সেস বিধিনিষেধ মনিটর এবং পরিচালনা করুন।"
      cards={[
        {
          label: "মোট লক",
          value: "0",
          description: "সকল ইউজারের সক্রিয় ডিভাইস লক।",
        },
        {
          label: "লক করা ডিভাইস",
          value: "0",
          description: "বর্তমানে সীমাবদ্ধ ডিভাইস।",
        },
      ]}
    />
  );
}
