import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Profile" description="Manage your account identity and contact preferences." cards={[{ label: "Profile status", value: "Placeholder", description: "Personal details will be connected later." },
        { label: "Account settings", description: "Security and notification preferences will appear here." }]} />; }
