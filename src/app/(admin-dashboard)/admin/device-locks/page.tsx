import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="Device Locks"
      description="Monitor and manage device-based access restrictions."
      cards={[
        {
          label: "Total Locks",
          value: "0",
          description: "Active device locks across all users.",
        },
        {
          label: "Locked Devices",
          value: "0",
          description: "Devices currently restricted.",
        },
      ]}
    />
  );
}
