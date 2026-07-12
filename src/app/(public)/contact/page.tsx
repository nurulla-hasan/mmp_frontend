import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Contact"
      description="Contact channels, support hours, and enquiry forms will be connected here in a later phase."
      cards={[
        { title: "Community help", description: "Ask general questions in the community.", href: "/community" },
        { title: "Service request", description: "Prepare a land-service requirement.", href: "/post-request" }
      ]}
    />
  );
}
