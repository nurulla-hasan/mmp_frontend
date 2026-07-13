import { Check, Sparkles } from "lucide-react";
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
              "flex flex-col " +
              (plan.recommended
                ? "relative border-primary/30 bg-primary/2 ring-2 ring-primary shadow-md"
                : "")
            }
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground z-10 shadow-sm flex items-center gap-1">
                <Sparkles className="size-3" />
                Recommended
              </span>
            )}
            <CardContent className="flex flex-1 flex-col p-6 md:p-7">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold md:text-4xl">{plan.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Button
                  className="w-full h-10 md:h-11"
                  variant={plan.recommended ? "default" : "outline"}
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  {plan.recommended ? "শুরু করুন" : "Plan নির্বাচন করুন"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground max-w-lg mx-auto leading-5">
        ⚡ Plan, মূল্য ও feature launch-এর আগে পরিবর্তিত হতে পারে। Pro সুবিধাগুলো
        শুধুমাত্র সাবস্ক্রাইবড user-দের জন্য উপলব্ধ।
      </p>
    </SectionWrapper>
  );
}
