import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="ব্রডকাস্ট"
      description="ইউজারদের কাছে ঘোষণা এবং নোটিফিকেশন পাঠান।"
      cards={[
        {
          label: "মোট ব্রডকাস্ট",
          value: "0",
          description: "পাঠানো ব্রডকাস্ট মেসেজ।",
        },
        {
          label: "বিচারাধীন",
          value: "0",
          description: "নির্ধারিত বা খসড়া ব্রডকাস্ট।",
        },
      ]}
    />
  );
}
