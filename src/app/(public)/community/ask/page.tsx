import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Ask the Community"
      description="Prepare a clear land-service question. Posting will be enabled after authentication and backend integration."
      cards={[
        { title: "Browse questions", description: "Review existing community discussions.", href: "/community" },
        { title: "Fraud awareness", description: "Check general safety guidance first.", href: "/fraud-awareness" }
      ]}
    />
  );
}
