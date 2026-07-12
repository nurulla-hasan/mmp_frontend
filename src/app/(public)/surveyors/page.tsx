import { PublicPage } from "@/components/shared/public-page";

export default function Page() {
  return (
    <PublicPage
      title="Find a Surveyor"
      description="Explore verified land surveyor profiles by service area, experience, equipment, availability, and reviews."
      cards={[
        { title: "Abdul Karim", description: "Experienced surveyor placeholder profile for Dinajpur.", href: "/surveyors/abdul-karim" },
        { title: "Rahim Uddin", description: "Digital survey equipment and boundary-service placeholder.", href: "/surveyors/rahim-uddin" },
        { title: "Nasima Akter", description: "Land measurement and report-service placeholder.", href: "/surveyors/nasima-akter" }
      ]}
    />
  );
}
