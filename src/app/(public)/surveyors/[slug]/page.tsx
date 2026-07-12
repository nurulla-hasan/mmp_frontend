import { PublicDynamicPage } from "@/components/shared/dynamic-page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicDynamicPage label="Surveyor Profile" value={slug} description="Review this surveyor's verification, services, service areas, equipment, availability, and client reviews." />;
}
