"use client";

import { Globe, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceAreasUpdate } from "./service-areas-update";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

const EMPTY = "কোনো সেবার এলাকা নির্বাচন করা হয়নি";

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

  // Map service areas with their labels and upazilas
  const areasWithLabels = serviceAreas
    .map((a) => {
      const match = districts.find((d) => d.value === a.district);
      return {
        districtValue: a.district,
        districtLabel: match?.label ?? a.district,
        upazilas: a.upazilas ?? [],
      };
    })
    .filter((a) => Boolean(a.districtLabel));

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <div className="flex items-center gap-2 font-semibold">
            <Globe className="size-4 text-primary" />
            <span>সেবার আওতাভুক্ত এলাকা</span>
            {areasWithLabels.length > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">
                {areasWithLabels.length} টি জেলা
              </Badge>
            )}
          </div>
          <ServiceAreasUpdate profile={profile} districts={districts} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {areasWithLabels.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {areasWithLabels.map((area) => (
              <div
                key={area.districtValue}
                className="rounded-lg border border-border/50 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  <span>{area.districtLabel}</span>
                </div>

                {area.upazilas.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {area.upazilas.map((upazila) => (
                      <Badge
                        key={upazila}
                        variant="outline"
                      >
                        {upazila}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    জেলার সকল উপজেলায় সেবা প্রযোজ্য
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center">
            <Globe className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">{EMPTY}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
