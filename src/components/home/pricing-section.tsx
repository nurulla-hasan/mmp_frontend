import { SectionHeading } from "@/components/home/section-heading";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" padding="md">
      <SectionHeading
        badge="Subscription Plans"
        title="কাজের প্রয়োজন অনুযায়ী সহজ Plan"
        description="Calculation save, professional report এবং Pro সুবিধার জন্য আপনার উপযুক্ত plan নির্বাচন করুন।"
      />
      <PricingCards compact />
    </SectionWrapper>
  );
}
