import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="Service Request" value={id} description="Requirement, quotations, participants, and workflow status will appear here." />; }
