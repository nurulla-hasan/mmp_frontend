import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PRICING_PLANS, PRICING_FEATURES } from "./pricing-data";
import { SectionWrapper } from "../ui/custom/section-wrapper";

interface PricingCardsProps {
  compact?: boolean;
}

export function PricingCards({ compact }: PricingCardsProps) {
  const features = compact
    ? PRICING_FEATURES.slice(0, 6)
    : PRICING_FEATURES;

  return (
    <SectionWrapper asSection>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PRICING_PLANS.map((plan, index) => (
          <Card
            key={plan.name}
            className={
              plan.recommended
                ? "relative flex flex-col overflow-visible ring-2 ring-primary shadow-lg shadow-primary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/15"
                : "relative flex flex-col overflow-visible transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20"
            }
          >
            {/* Glow background for recommended */}
            {plan.recommended && (
              <div className="pointer-events-none absolute -inset-px rounded-[calc(var(--radius-xl)+1px)] bg-linear-to-b from-primary/5 via-transparent to-transparent opacity-60" />
            )}

            {/* Recommended badge */}
            {plan.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20">
                সেরা পছন্দ
              </span>
            )}

            <CardContent className="relative flex flex-col">
              {/* Header: Icon + Title */}
              <div className="flex items-center gap-4">
                <div
                  className={
                    plan.recommended
                      ? "flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm"
                      : "flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted-foreground/5 text-muted-foreground"
                  }
                >
                  {index === 0 && (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
              </div>

              {!compact && (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
              )}

              {/* Price */}
              <div className="mt-5">
                <span className="text-4xl font-bold tracking-tight md:text-5xl font-heading">
                  {plan.price}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {plan.duration}
              </p>

              {/* Features */}
              <div className="mt-6 mb-4 rounded bg-primary/5 p-2 text-center text-xs font-medium text-primary">
                ল্যান্ড মেজারমেন্ট, ডিজিটাল প্যান্টাগ্রাফ ও ম্যাপ ট্রেসার—সবগুলো টুল ব্যবহার করুন।
              </div>
              <ul className="flex-1 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
                {plan.name === "বার্ষিক প্রো" && (
                  <li className="flex items-start gap-3 text-sm font-medium text-primary">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span>নতুন ফিচারে অগ্রাধিকার ভিত্তিতে অ্যাক্সেস</span>
                  </li>
                )}
              </ul>

              {/* CTA */}
              <Button
                className="mt-6 w-full cursor-pointer"
                variant={plan.recommended ? "default" : "outline"}
                size="lg"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                {plan.recommended ? "এখনই শুরু করুন" : "প্ল্যান নির্বাচন করুন"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {compact && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          প্ল্যান, মূল্য ও ফিচার লঞ্চ-এর আগে পরিবর্তিত হতে পারে।
        </p>
      )}
    </SectionWrapper>
  );
}
