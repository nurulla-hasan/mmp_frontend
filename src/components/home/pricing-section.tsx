import { Check } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const plans = [
  {
    name: "Monthly Pro",
    price: "৳৯৯",
    period: "/মাস",
    recommended: false,
  },
  {
    name: "৬ Months Pro",
    price: "৳৫৯৯",
    period: "/৬ মাস",
    recommended: false,
  },
  {
    name: "Yearly Pro",
    price: "৳৯৯৯",
    period: "/বছর",
    recommended: true,
  },
];

const features = [
  "Fair usage অনুযায়ী calculation project",
  "Multiple plot calculation",
  "Project save",
  "PDF/Print report",
  "Priority updates",
  "Device-based secure access",
];

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" padding="md">
      <SectionHeading
        badge="Subscription Plans"
        title="কাজের প্রয়োজন অনুযায়ী সহজ Plan"
        description="Calculation save, professional report এবং Pro সুবিধার জন্য আপনার উপযুক্ত plan নির্বাচন করুন।"
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.recommended
                ? "relative ring-2 ring-primary shadow-sm"
                : ""
            }
          >
            {plan.recommended && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground z-10">
                Recommended
              </span>
            )}
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <ul className="mt-6 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
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
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Plan, মূল্য ও feature launch-এর আগে পরিবর্তিত হতে পারে।
      </p>
    </SectionWrapper>
  );
}
