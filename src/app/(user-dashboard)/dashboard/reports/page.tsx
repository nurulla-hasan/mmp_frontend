import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Survey Reports" description="Access structured measurement and survey report records." cards={[{ label: "Available reports", value: "0", description: "Completed reports will appear here." },
        { label: "Bookings", href: "/dashboard/bookings", description: "Review the jobs connected to reports." }]} />; }
