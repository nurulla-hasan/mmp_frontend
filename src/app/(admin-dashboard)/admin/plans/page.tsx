import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="Plans"
      description="Configure subscription plans and pricing tiers."
      cards={[
        {
          label: "Active Plans",
          value: "0",
          description: "Currently available subscription plans.",
        },
        {
          label: "Total Revenue",
          value: "$0",
          description: "Revenue generated from all plans.",
        },
      ]}
    />
  );
}
