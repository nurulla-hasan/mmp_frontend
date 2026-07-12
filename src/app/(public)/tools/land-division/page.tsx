import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Land Division"
      description="A foundation for dividing a measured land area among multiple shares."
      cards={[
        { title: "Saved calculations", description: "Your saved division results will appear in the dashboard.", href: "/dashboard/calculations" },
        { title: "Service guide", description: "Learn what to prepare before dividing land.", href: "/service-guides/land-division" }
      ]}
    />
  );
}
