import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="রিকোয়েস্ট" value={id} description="রিকোয়েস্টের বিবরণ এবং কোটেশন প্রস্তুতি এখানে দেখাবে।" />; }
