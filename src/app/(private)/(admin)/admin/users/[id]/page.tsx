import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="User" value={id} description="Account details, status, and platform activity will appear here." />; }
