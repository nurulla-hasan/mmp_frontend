import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Post Your Land Requirement"
      description="Describe the location, land area, service type, preferred date, and budget. Surveyors will be able to submit quotations later."
      cards={[
        { title: "Browse Surveyors", description: "Review surveyor profiles before posting.", href: "/surveyors" },
        { title: "My Service Requests", description: "Track requests from your dashboard.", href: "/dashboard/service-requests" }
      ]}
    />
  );
}
