"use client";

import { Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceAreasUpdate } from "./service-areas-update";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

const EMPTY = "তথ্য দেওয়া হয়নি";

type DistrictOption = { value: string; label: string; upazilas: string[] };

type ServiceAreasSectionProps = {
  profile: TSurveyorProfile | null;
  districts: DistrictOption[];
};

export function ServiceAreasSection({
  profile,
  districts,
}: ServiceAreasSectionProps) {
  const serviceAreas = profile?.serviceAreas ?? [];

  // Map selected district values to their labels
  const selectedLabels = serviceAreas
    .map((a) => districts.find((d) => d.value === a.district)?.label)
    .filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            সেবার এলাকা
          </span>
          <ServiceAreasUpdate profile={profile} districts={districts} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <Badge key={label} size="lg" variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{EMPTY}</p>
        )}
      </CardContent>
    </Card>
  );
}
