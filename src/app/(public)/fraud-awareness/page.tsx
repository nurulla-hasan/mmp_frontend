import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Land Fraud Awareness"
      description="General educational checklists for safer land-service decisions. This content is not legal advice."
      cards={[
        { title: "Verify records", description: "Compare deed, khatian, mutation, tax, and map information.", href: "/service-guides/record-verification" },
        { title: "Check possession", description: "Confirm real-world possession and boundaries with qualified help.", href: "/surveyors" },
        { title: "Use official sources", description: "Follow verified government portals and offices.", href: "/service-guides" }
      ]}
    />
  );
}
