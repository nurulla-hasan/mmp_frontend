import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="Request" value={id} description="Requirement details and quotation preparation will appear here." />; }
