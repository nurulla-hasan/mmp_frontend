import { DashboardDynamicPage } from "@/components/shared/dynamic-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <DashboardDynamicPage label="ভেরিফিকেশন রিকোয়েস্ট" value={id} description="জমা দেওয়া আইডেন্টিটি এবং পেশাদার প্রমাণ এখানে দেখাবে।" />; }
