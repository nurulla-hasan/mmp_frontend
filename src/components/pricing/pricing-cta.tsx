import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";

export function PricingCta() {
  return (
    <SectionWrapper>
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-primary/2 px-6 py-16 text-center shadow-sm">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/4 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-primary/4 blur-3xl" />
        </div>

        <div className="relative">
          <SectionHeading
            title="আপনার প্রয়োজন অনুযায়ী শুরু করুন"
            description="Basic Land Tools ব্যবহার করে দেখুন অথবা calculation save ও professional report-এর জন্য Pro plan নির্বাচন করুন।"
            titleClassName="text-2xl font-bold sm:text-3xl"
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="shadow-sm"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Free Account খুলুন
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="shadow-xs"
              nativeButton={false}
              render={<Link href="/tools" />}
            >
              Land Tools দেখুন
            </Button>
          </div>
          <p className="mt-5">
            <Link
              href="/surveyors"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              সার্ভেয়ার খুঁজুন &rarr;
            </Link>
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
