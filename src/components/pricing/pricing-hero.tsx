import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export function PricingHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/3 via-transparent to-transparent">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <SectionWrapper>
        <SectionHeading
          badge="Subscription Plans"
          title="আপনার কাজের জন্য সঠিক Plan নির্বাচন করুন"
          description="জমির হিসাব সংরক্ষণ, একাধিক plot পরিচালনা এবং professional PDF report তৈরির জন্য প্রয়োজন অনুযায়ী Pro plan বেছে নিন।"
        >
          <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-foreground shadow-xs">
              <svg className="size-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              পরিষ্কার plan duration
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-foreground shadow-xs">
              <svg className="size-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Account-based secure access
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-foreground shadow-xs">
              <svg className="size-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Flexible pricing
            </span>
          </div>
        </SectionHeading>
      </SectionWrapper>
    </section>
  );
}
