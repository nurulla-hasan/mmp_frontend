import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="Job" value={id} description="Booking, visit, measurement, report, and completion activity will appear here." />; }
