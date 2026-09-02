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
import { getAllSurveyors } from "@/services/surveyor.service";
import { getServices } from "@/services/service.service";
import { getTestimonials } from "@/services/review.service";

export default async function HomePage() {
  const [surveyorsRes, servicesRes, testimonialsRes] = await Promise.allSettled([
    getAllSurveyors({ limit: 6, isVerified: "true" }),
    getServices(),
    getTestimonials(),
  ]);

  const surveyors =
    surveyorsRes.status === "fulfilled" && surveyorsRes.value.success
      ? surveyorsRes.value.data
      : [];

  const totalSurveyors =
    surveyorsRes.status === "fulfilled" && surveyorsRes.value.success
      ? (surveyorsRes.value.meta?.total ?? surveyors.length)
      : undefined;

  const services =
    servicesRes.status === "fulfilled" && servicesRes.value.success
      ? servicesRes.value.data
      : [];

  const testimonials =
    testimonialsRes.status === "fulfilled" && testimonialsRes.value.success
      ? testimonialsRes.value.data
      : [];

  return (
    <main>
      <HeroSection totalSurveyors={totalSurveyors} />
      <QuickActionsSection />
      <TrustHighlightsSection />
      <PopularServicesSection services={services} />
      <HowItWorksSection />
      <FeaturedSurveyorsSection surveyors={surveyors} />
      <LandToolsSection />
      <SavedCalculationsSection />
      <RoleBenefitsSection />
      <ProfessionalReportSection />
      {/* <PricingSection /> */}
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
