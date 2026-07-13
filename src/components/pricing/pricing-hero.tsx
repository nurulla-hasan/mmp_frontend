import { CheckIcon } from "lucide-react";

import { SectionWrapper } from "@/components/shared/section-wrapper";

const perks = [
  { label: "পরিষ্কার plan duration", icon: CheckIcon },
  { label: "Device-based secure access", icon: CheckIcon },
  { label: "Flexible pricing", icon: CheckIcon },
];

export function PricingHero() {
  return (
    <SectionWrapper padding="lg">
      <div className="relative mx-auto max-w-3xl text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 -top-20 mx-auto size-96 rounded-full bg-primary/5 blur-3xl" />

        {/* Icon */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
          <svg
            className="size-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
          আপনার কাজের জন্য সঠিক <br className="hidden sm:inline" />
          <span className="text-primary">Plan</span> নির্বাচন করুন
        </h1>
        <p className="mt-4 text-lg leading-7 text-muted-foreground">
          জমির হিসাব সংরক্ষণ, একাধিক plot পরিচালনা এবং professional PDF report
          তৈরির জন্য প্রয়োজন অনুযায়ী Pro plan বেছে নিন।
        </p>

        {/* Perk pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <span
                key={perk.label}
                className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-xs font-medium text-foreground shadow-xs backdrop-blur-sm"
              >
                <Icon className="size-3.5 text-primary" />
                {perk.label}
              </span>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
