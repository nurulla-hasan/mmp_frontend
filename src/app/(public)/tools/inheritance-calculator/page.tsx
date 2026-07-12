import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Inheritance Calculator"
      description="A calculation workspace for inheritance-based land shares. It will provide guidance, not legal advice."
      cards={[
        { title: "Land division", description: "Open the general division tool.", href: "/tools/land-division" },
        { title: "Service guides", description: "Review educational land-service guidance.", href: "/service-guides" }
      ]}
    />
  );
}
