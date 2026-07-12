import { DashboardPage } from "@/components/shared/dashboard-page";
export default function Page() { return <DashboardPage title="Bookings" description="Review upcoming visits and completed bookings." cards={[{ label: "Upcoming visits", value: "0", description: "Scheduled surveyor visits will appear here." },
        { label: "Completed bookings", value: "0", description: "Booking history will appear here." }]} />; }
