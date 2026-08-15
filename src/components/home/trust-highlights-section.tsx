import { BadgeCheck, FileCheck, Lock, Save } from "lucide-react";

import { SectionWrapper } from "@/components/common/section-wrapper";

const highlights = [
  {
    icon: BadgeCheck,
    label: "যাচাইকৃত প্রোফাইল",
    description: "Surveyor-এর পরিচয় ও verification status দেখুন।",
  },
  {
    icon: FileCheck,
    label: "স্বচ্ছ কোটেশন",
    description: "একাধিক প্রস্তাব তুলনা করে সিদ্ধান্ত নিন।",
  },
  {
    icon: Save,
    label: "সংরক্ষিত হিসাব",
    description: "ক্যালকুলেশন প্রজেক্ট সেভ করে পরে আবার কাজ করুন।",
  },
  {
    icon: Lock,
    label: "নিরাপদ Account Access",
    description: "Subscription ও device-based account protection।",
  },
];

export function TrustHighlightsSection() {
  return (
    <SectionWrapper id="trust-highlights" asSection>
      <div className="rounded-2xl bg-primary/5 py-10 sm:py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="mt-4 font-medium">{item.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
