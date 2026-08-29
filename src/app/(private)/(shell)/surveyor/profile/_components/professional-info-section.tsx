"use client";

import { BadgeInfo, BookOpen, Briefcase, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DISTRICT_OPTIONS } from "@/validation/join-as-surveyor.schema";
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
  const experienceYears = profile?.experienceYears;
  const primaryDistrict = profile?.primaryLocation?.district;
  const primaryUpazila = profile?.primaryLocation?.upazila;
  const bio = profile?.bio;

  // Map district value to its label for display
  const districtLabel =
    DISTRICT_OPTIONS.find((d) => d.value === primaryDistrict)?.label ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" />
            পেশাগত তথ্য
          </span>
          <ProfessionalInfoUpdate profile={profile} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* ── Headline (view) ── */}
          <div className="sm:col-span-2">
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <BadgeInfo className="size-3.5" />
              পেশাদার শিরোনাম
            </p>
            <p className="mt-1 text-sm">{headline ? headline : EMPTY}</p>
          </div>

          {/* ── Experience (view) ── */}
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <BookOpen className="size-3.5" />
              অভিজ্ঞতা (বছর)
            </p>
            <p className="mt-1 text-sm">
              {experienceYears !== undefined && experienceYears !== null
                ? experienceYears
                : EMPTY}
            </p>
          </div>

          {/* ── Primary District (view) ── */}
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="size-3.5" />
              প্রধান অবস্থান (জেলা)
            </p>
            <p className="mt-1 text-sm">
              {districtLabel ? districtLabel : EMPTY}
            </p>
          </div>

          {/* ── Primary Upazila (view) ── */}
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              উপজেলা/থানা
            </p>
            <p className="mt-1 text-sm">
              {primaryUpazila ? primaryUpazila : EMPTY}
            </p>
          </div>

          {/* ── Bio (view) ── */}
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">সম্পর্কে</p>
            <p className="mt-1 whitespace-pre-line text-sm">
              {bio ? bio : EMPTY}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
