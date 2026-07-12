import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Documents" description="Manage job-related document references and controlled sharing." cards={[{ label: "Job documents", value: "0", description: "Documents associated with service jobs will appear here." },
        { label: "Privacy", description: "Access and retention controls will be connected later." }]} />; }
