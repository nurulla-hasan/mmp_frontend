import {
  BadgeCheck,
  FileCheck,
  Lock,
  Save,
} from "lucide-react";

import { SectionWrapper } from "@/components/shared/section-wrapper";

const highlights = [
  {
    icon: BadgeCheck,
    label: "যাচাইকৃত প্রোফাইল",
    description: "Surveyor-এর পরিচয় ও verification status",
  },
  {
    icon: FileCheck,
    label: "স্বচ্ছ Quotation",
    description: "একাধিক প্রস্তাব তুলনা করে সিদ্ধান্ত নিন",
  },
  {
    icon: Save,
    label: "সংরক্ষিত হিসাব",
    description: "Calculation project save করে পরে কাজ করুন",
  },
  {
    icon: Lock,
    label: "নিরাপদ Access",
    description: "Subscription ও device-based account protection",
  },
];

export function TrustHighlightsSection() {
  return (
    <SectionWrapper id="trust-highlights" padding="none" spacing={false}>
      <div className="border-y bg-primary/5">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-primary/10 px-5 py-5 last:border-0"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{item.label}</h3>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
