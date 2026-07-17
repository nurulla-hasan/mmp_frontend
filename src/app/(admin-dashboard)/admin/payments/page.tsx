import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="পেমেন্ট"
      description="পেমেন্ট লেনদেন এবং ইতিহাস দেখুন ও পরিচালনা করুন।"
      cards={[
        {
          label: "মোট লেনদেন",
          value: "0",
          description: "সমস্ত পেমেন্ট লেনদেন প্রক্রিয়াকৃত।",
        },
        {
          label: "বিচারাধীন পেমেন্ট",
          value: "0",
          description: "নিশ্চিতকরণের অপেক্ষায় থাকা পেমেন্ট।",
        },
        {
          label: "মোট আয়",
          value: "৳০",
          description: "সমস্ত লেনদেন থেকে মোট আয়।",
        },
      ]}
    />
  );
}
