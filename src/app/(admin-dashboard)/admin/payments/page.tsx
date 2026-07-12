import { DashboardPage } from "@/components/shared/dashboard-page";

export default function Page() {
  return (
    <DashboardPage
      title="Payments"
      description="View and manage payment transactions and history."
      cards={[
        {
          label: "Total Transactions",
          value: "0",
          description: "All payment transactions processed.",
        },
        {
          label: "Pending Payments",
          value: "0",
          description: "Payments awaiting confirmation.",
        },
        {
          label: "Total Revenue",
          value: "$0",
          description: "Total revenue from all transactions.",
        },
      ]}
    />
  );
}
