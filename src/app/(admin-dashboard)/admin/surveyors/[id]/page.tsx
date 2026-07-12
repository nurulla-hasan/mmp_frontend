import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="Surveyor" value={id} description="Professional profile, verification, services, and activity will appear here." />; }
