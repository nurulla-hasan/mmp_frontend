import { PublicDynamicPage } from "@/components/shared/dynamic-page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicDynamicPage label="Service Guide" value={slug} description="Educational steps, required documents, official resources, and common cautions will appear here." />;
}
