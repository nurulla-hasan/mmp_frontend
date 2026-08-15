import {
  FreeVsPro,
  PlanComparison,
  PricingCards,
  PricingCta,
  PricingFaq,
  PricingHero,
  PricingPolicies,
} from "./_components";

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
