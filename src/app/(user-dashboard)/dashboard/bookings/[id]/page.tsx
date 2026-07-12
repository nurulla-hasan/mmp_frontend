import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="Booking" value={id} description="Appointment, location, messages, documents, and work status will appear here." />; }
