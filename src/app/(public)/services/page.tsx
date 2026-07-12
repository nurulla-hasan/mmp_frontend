import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Land Services"
      description="Browse service categories and understand which type of surveyor support may fit your land-service need."
      cards={[
        { title: "Boundary Identification", description: "Plan an on-site boundary identification request.", href: "/services/boundary-identification" },
        { title: "Land Measurement", description: "Request professional land measurement support.", href: "/services/land-measurement" },
        { title: "Land Division", description: "Find support for measurement-based land division.", href: "/services/land-division" }
      ]}
    />
  );
}
