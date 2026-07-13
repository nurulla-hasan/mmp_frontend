import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PRICING_PLANS, PRICING_FEATURES } from "./pricing-data";
import { SectionWrapper } from "../shared/section-wrapper";

interface PricingCardsProps {
  compact?: boolean;
}

export function PricingCards({ compact }: PricingCardsProps) {
  const features = compact
    ? PRICING_FEATURES.slice(0, 6)
    : PRICING_FEATURES;

  return (
    <section className="bg-muted/30">
      <SectionWrapper>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.recommended
                  ? "relative flex flex-col ring-2 ring-primary shadow-md overflow-visible transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  : "relative flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              }
            >
              {plan.recommended && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground z-10 whitespace-nowrap">
                  Recommended
                </span>
              )}
              <CardContent className="flex flex-col p-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {!compact && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                )}
                <div className="mt-4">
                  <span className="text-3xl font-bold md:text-4xl">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {plan.duration}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="size-3 text-primary" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-6 w-full cursor-pointer"
                  variant={plan.recommended ? "default" : "outline"}
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Plan নির্বাচন করুন
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {compact && (
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Plan, মূল্য ও feature launch-এর আগে পরিবর্তিত হতে পারে।
          </p>
        )}
      </SectionWrapper>
    </section>
  );
}
