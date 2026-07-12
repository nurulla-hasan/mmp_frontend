import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="Broadcast"
      description="Send announcements and notifications to users."
      cards={[
        {
          label: "Total Broadcasts",
          value: "0",
          description: "Broadcast messages sent.",
        },
        {
          label: "Pending",
          value: "0",
          description: "Scheduled or draft broadcasts.",
        },
      ]}
    />
  );
}
