import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Community Q&A"
      description="Ask land-service questions and learn from verified surveyors and community experts."
      cards={[
        { title: "RS and BS Khatian", description: "View a sample record-related discussion.", href: "/community/questions/rs-vs-bs-khatian" },
        { title: "Boundary mismatch", description: "View a sample boundary question.", href: "/community/questions/boundary-mismatch" },
        { title: "Ask a question", description: "Prepare a new community question.", href: "/community/ask" }
      ]}
    />
  );
}
