import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="অ্যাডমিন ম্যানেজমেন্ট"
      description="প্ল্যাটফর্ম অ্যাডমিন, তাদের ভূমিকা এবং অ্যাক্সেস অনুমতি পরিচালনা করুন।"
      cards={[
        {
          label: "সক্রিয় অ্যাডমিন",
          value: "0",
          description: "অ্যাডমিন অ্যাকাউন্ট এবং রোল অ্যাসাইনমেন্ট এখানে দেখাবে।",
        },
        {
          label: "রোল ম্যানেজমেন্ট",
          description: "অ্যাডমিন রোল এবং অনুমতি তৈরি ও পরিচালনা করুন।",
        },
      ]}
    />
  );
}
