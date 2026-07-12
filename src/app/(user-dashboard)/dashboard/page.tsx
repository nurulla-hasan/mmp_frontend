import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="User Dashboard" description="A friendly overview of your land-service activity." cards={[{ label: "Active Requests", value: "0", href: "/dashboard/service-requests", description: "Track submitted service requirements." }]} />; }
