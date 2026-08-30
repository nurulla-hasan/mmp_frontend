import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { SurveyorCard } from "@/app/(public)/surveyors/_components/surveyor-card";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function FeaturedSurveyorsSection({
  surveyors = [],
}: {
  surveyors?: TSurveyorProfile[];
}) {
  if (surveyors.length === 0) return null;

  return (
    <SectionWrapper id="surveyors" bg="muted">
      <SectionHeading
        badge="পেশাজীবী ডিরেক্টরি"
        title="আপনার এলাকার অভিজ্ঞ সার্ভেয়ারদের সঙ্গে যুক্ত হন"
        description="কাজের অভিজ্ঞতা, ক্লায়েন্ট রেটিং, ভেরিফিকেশন স্ট্যাটাস ও রেট দেখে সরাসরি বিশ্বস্ত সার্ভেয়ার নির্বাচন করুন।"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {surveyors.map((surveyor) => (
          <SurveyorCard key={surveyor.id || surveyor.slug} surveyor={surveyor} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          render={<Link href="/surveyors" />}
        >
          সকল ভেরিফায়েড সার্ভেয়ার দেখুন &rarr;
        </Button>
      </div>
    </SectionWrapper>
  );
}
