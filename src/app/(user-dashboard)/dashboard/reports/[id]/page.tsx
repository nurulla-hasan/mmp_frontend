import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="Survey Report" value={id} description="Structured measurement details, map references, notes, and signatures will appear here." />; }
