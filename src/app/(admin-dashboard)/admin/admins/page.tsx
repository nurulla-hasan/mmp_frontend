import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="Admin Management"
      description="Manage platform administrators, their roles and access permissions."
      cards={[
        {
          label: "Active admins",
          value: "0",
          description: "Admin accounts and role assignments will appear here.",
        },
        {
          label: "Role management",
          description: "Create and manage admin roles and permissions.",
        },
      ]}
    />
  );
}
