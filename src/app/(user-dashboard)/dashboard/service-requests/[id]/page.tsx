import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="Service Request" value={id} description="Requirement details, quotations, selected surveyor, and progress will appear here." />; }
