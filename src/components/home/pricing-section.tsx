import { SectionHeading } from "@/components/common/section-heading";
import { PricingCards } from "@/app/(shell)/pricing/_components/pricing-cards";
import { SectionWrapper } from "@/components/common/section-wrapper";

export function PricingSection() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 h-125 w-125 -translate-y-1/2 -translate-x-1/4 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-100 w-100 -translate-y-1/2 translate-x-1/4 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <SectionWrapper id="pricing">
        <SectionHeading
          badge="সাবস্ক্রিপশন প্লান"
          title="কাজের প্রয়োজন অনুযায়ী সহজ Plan"
          description="ক্যালকুলেশন সেভ, পেশাদার রিপোর্ট এবং প্রো সুবিধার জন্য আপনার উপযুক্ত প্ল্যান নির্বাচন করুন।"
        />
        <PricingCards compact />
      </SectionWrapper>
    </div>
  );
}
