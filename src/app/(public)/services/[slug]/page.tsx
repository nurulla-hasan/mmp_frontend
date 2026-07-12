import { PublicDynamicPage } from "@/components/shared/dynamic-page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicDynamicPage label="Service" value={slug} description="Service details, preparation guidance, expected workflow, and connected surveyors will appear here." />;
}
