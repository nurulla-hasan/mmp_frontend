import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="User Dashboard" description="A friendly overview of your land-service activity." cards={[{ label: "Active Requests", value: "0", href: "/dashboard/service-requests", description: "Track submitted service requirements." },
        { label: "Upcoming Booking", value: "0", href: "/dashboard/bookings", description: "Review scheduled surveyor visits." },
        { label: "Saved Properties", value: "0", href: "/dashboard/properties", description: "Keep property references organized." },
        { label: "Available Reports", value: "0", href: "/dashboard/reports", description: "Access completed survey reports." }]} />; }
