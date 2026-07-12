import { PublicDynamicPage } from "@/components/shared/dynamic-page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicDynamicPage label="Community Question" value={slug} description="Question details, verified surveyor answers, voting, and moderation placeholders belong here." />;
}
