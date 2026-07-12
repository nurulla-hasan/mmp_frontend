import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Quotations" description="Compare surveyor pricing, experience, timing, and service notes." cards={[{ label: "Received quotations", value: "0", description: "Comparable quotations will appear here." },
        { label: "Service requests", href: "/dashboard/service-requests", description: "Review the requests linked to quotations." }]} />; }
