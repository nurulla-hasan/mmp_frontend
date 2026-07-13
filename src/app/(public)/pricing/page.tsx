import {
  FreeVsPro,
  PlanComparison,
  PricingCards,
  PricingCta,
  PricingFaq,
  PricingHero,
  PricingPolicies,
} from "@/components/pricing";

export default function PricingPage() {
  return (
    <main>
      <PricingHero />
      <PricingCards />
      <PlanComparison />
      <FreeVsPro />
      <PricingPolicies />
      <PricingFaq />
      <PricingCta />
    </main>
  );
}
