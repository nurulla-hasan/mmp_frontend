import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="About Mouza Map Pro"
      description="A focused platform concept connecting practical land tools, verified surveyors, guided service workflows, and educational content."
      cards={[
        { title: "Explore tools", description: "See the land calculation foundation.", href: "/tools" },
        { title: "Find surveyors", description: "Browse professional profiles.", href: "/surveyors" }
      ]}
    />
  );
}
