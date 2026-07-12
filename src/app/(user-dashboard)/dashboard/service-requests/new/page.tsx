import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="New Service Request" description="Prepare the details for a new land-service requirement." cards={[{ label: "Requirement details", description: "Location, service type, date, and budget fields will be added later." },
        { label: "Browse surveyors", href: "/surveyors", description: "Review professional profiles first." }]} />; }
