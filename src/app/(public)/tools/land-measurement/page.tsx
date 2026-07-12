import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Land Measurement"
      description="Enter dimensions and calculate land area. The final calculator will be connected in a later phase."
      cards={[
        { title: "View other tools", description: "Explore the complete land-tool collection.", href: "/tools" },
        { title: "Find a Surveyor", description: "Get professional support for on-site measurement.", href: "/surveyors" }
      ]}
    />
  );
}
