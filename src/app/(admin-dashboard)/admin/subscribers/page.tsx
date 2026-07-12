import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="Subscribers"
      description="Manage platform subscribers and their subscription status."
      cards={[
        {
          label: "Total Subscribers",
          value: "0",
          description: "Active subscribed users.",
        },
        {
          label: "New This Month",
          value: "0",
          description: "Subscribers joined this month.",
        },
      ]}
    />
  );
}
