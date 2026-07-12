import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Reviews" description="Share feedback only for completed service jobs." cards={[{ label: "Pending reviews", value: "0", description: "Completed jobs awaiting feedback will appear here." },
        { label: "Submitted reviews", value: "0", description: "Your review history will appear here." }]} />; }
