import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Saved Calculations" description="Review saved land measurements, divisions, and conversions." cards={[{ label: "Calculation history", value: "", description: "Saved calculations will appear here." },
        { label: "Open tools", href: "/tools", description: "Create a new land calculation." }]} />; }
