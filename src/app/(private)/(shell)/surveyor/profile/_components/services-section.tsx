"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicesUpdate } from "./services-update";
import type { TSurveyorProfile, TSurveyorService } from "@/interface/surveyor-profile";

const EMPTY = "তথ্য দেওয়া হয়নি";

type ServicesSectionProps = {
  profile: TSurveyorProfile | null;
  services: TSurveyorService[];
};

export function ServicesSection({
  profile,
  services,
}: ServicesSectionProps) {
  const servicesList = profile?.surveyorServices ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>আপনার সেবাসমূহ</span>
          <ServicesUpdate profile={profile} services={services} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {servicesList.length > 0 ? (
          <div className="space-y-3">
            {servicesList.map((service, index) => (
              <div
                key={`${service.service.slug}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
              >
                <p className="text-sm font-medium">{service.service.name}</p>
                <p className="text-sm text-muted-foreground">
                  ৳{service.startingPrice ?? 0}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {EMPTY}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
