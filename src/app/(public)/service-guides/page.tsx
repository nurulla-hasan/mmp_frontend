import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Land Service Guides"
      description="Educational guides explaining common land-service steps, documents, official portals, and when professional help may be useful."
      cards={[
        { title: "Preparing for Land Measurement", description: "A checklist for an on-site measurement visit.", href: "/service-guides/preparing-for-land-measurement" },
        { title: "Understanding Khatian Records", description: "A plain-language record overview.", href: "/service-guides/understanding-khatian" },
        { title: "Boundary Verification", description: "Common preparation and safety considerations.", href: "/service-guides/boundary-verification" }
      ]}
    />
  );
}
