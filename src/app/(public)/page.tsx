import {
  FaqSection,
  FeaturedSurveyorsSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  LandToolsSection,
  PopularServicesSection,
  // PricingSection,
  ProfessionalReportSection,
  QuickActionsSection,
  RoleBenefitsSection,
  SavedCalculationsSection,
  TestimonialsSection,
  TrustHighlightsSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <QuickActionsSection />
      <TrustHighlightsSection />
      <PopularServicesSection />
      <HowItWorksSection />
      <FeaturedSurveyorsSection />
      <LandToolsSection />
      <SavedCalculationsSection />
      <RoleBenefitsSection />
      <ProfessionalReportSection />
      {/* <PricingSection /> */}
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
