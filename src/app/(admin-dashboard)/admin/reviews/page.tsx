import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Reviews" description="Moderate verified-job client feedback." cards={[{ label: "Published reviews", value: "0", description: "Verified reviews will appear here." },{ label: "Reported reviews", value: "0", description: "Moderation reports will appear here." }]} />; }
