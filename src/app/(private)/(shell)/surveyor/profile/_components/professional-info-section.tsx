"use client";

import { BadgeInfo, BookOpen, Briefcase, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfessionalInfoUpdate } from "./professional-info-update";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

const EMPTY = "তথ্য দেওয়া হয়নি";

type ProfessionalInfoSectionProps = {
  profile: TSurveyorProfile | null;
};

export function ProfessionalInfoSection({
  profile,
}: ProfessionalInfoSectionProps) {
  const headline = profile?.headline;
  const experienceYears = profile?.experienceYears ?? 0;
  const bio = profile?.bio;

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2 font-semibold">
            <Briefcase className="size-4 text-primary" />
            পেশাগত পরিচিতি ও বিবরণ
          </span>
          <ProfessionalInfoUpdate profile={profile} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Headline */}
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3.5 sm:col-span-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BadgeInfo className="size-3.5 text-primary" />
              পেশাদার শিরোনাম
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {headline || EMPTY}
            </p>
          </div>

          {/* Experience */}
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3.5 sm:col-span-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="size-3.5 text-primary" />
              কাজের অভিজ্ঞতা
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {experienceYears > 0 ? `${experienceYears} বছর সক্রিয় পেশাদার অভিজ্ঞতা` : EMPTY}
            </p>
          </div>
        </div>

        {/* Bio / About */}
        <div className="rounded-lg border border-border/40 bg-muted/10 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="size-3.5 text-primary" />
            সার্ভেয়ার সম্পর্কে (Bio)
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {bio || "আপনার পেশাগত ক্যারিয়ার, দক্ষতা ও সেবার ধরন সম্পর্কে বিস্তারিত লিখুন যাতে ক্লায়েন্টরা আপনাকে সহজে খুঁজে পায়।"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
