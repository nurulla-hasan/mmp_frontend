import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="My Properties" description="Organize property references and related land details." cards={[{ label: "Property records", value: "", description: "Property profiles will appear here." },
        { label: "Add later", description: "Property creation will be connected with backend forms." }]} />; }
