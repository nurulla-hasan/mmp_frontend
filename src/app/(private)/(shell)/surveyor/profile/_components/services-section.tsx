"use client";

import { Award, CheckCircle, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicesUpdate } from "./services-update";
import type { TSurveyorProfile, TSurveyorService } from "@/interface/surveyor-profile";

const EMPTY = "কোনো সেবা যুক্ত করা হয়নি";

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
    <Card className="border-border/60 shadow-xs">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <div className="flex items-center gap-2 font-semibold">
            <Award className="size-4 text-primary" />
            <span>প্রদেয় সেবাসমূহ ও মূল্যতালিকা</span>
            {servicesList.length > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">
                {servicesList.length} টি সেবা
              </Badge>
            )}
          </div>
          <ServicesUpdate profile={profile} services={services} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {servicesList.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {servicesList.map((service, index) => (
              <div
                key={`${service.service.slug}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <CheckCircle className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {service.service.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      পেশাদার ভূমি সেবা
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <Badge variant="success">
                    <Tag className="mr-1 size-3" />
                    ৳{(service.startingPrice ?? 0).toLocaleString("bn-BD")}
                  </Badge>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    থেকে শুরু
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center">
            <Award className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">{EMPTY}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
