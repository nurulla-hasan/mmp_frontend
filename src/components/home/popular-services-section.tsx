import {
  Compass,
  FileText,
  LandPlot,
  Layers,
  Map,
  MapPinned,
  Ruler,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TSurveyorService } from "@/interface/surveyor-profile";

const iconMap: Record<string, typeof Ruler> = {
  "land-measurement": Ruler,
  "land-division": LandPlot,
  "boundary-determination": Map,
  "digital-survey": MapPinned,
  "mouza-map": FileText,
  "measurement-report": Compass,
};

export function PopularServicesSection({
  services = [],
}: {
  services?: TSurveyorService[];
}) {
  if (services.length === 0) return null;

  return (
    <SectionWrapper id="services" bg="muted">
      <SectionHeading
        badge="জনপ্রিয় সেবা"
        title="জমির কাজে যে সেবাগুলো সবচেয়ে বেশি প্রয়োজন"
        description="আপনার প্রয়োজনীয় সেবা নির্বাচন করে সরাসরি সংশ্লিষ্ট সার্ভেয়ারদের প্রোফাইল ও কাজের রেট দেখুন।"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = iconMap[service.slug] || Layers;
          return (
            <Link
              key={service.id || service.slug}
              href={`/surveyors?service=${service.slug}`}
              className="group transition-all hover:-translate-y-0.5"
            >
              <Card className="h-full transition-all group-hover:ring-primary/30 group-hover:shadow-sm">
                <CardContent className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-3 font-semibold font-heading text-base text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground line-clamp-2">
                      {service.description ||
                        "দক্ষ ও ভেরিফাইড সার্ভেয়ারের মাধ্যমে নির্ভুল পরিমাপ সেবা গ্রহণ করুন।"}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    সার্ভেয়ার খুঁজুন
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/surveyors" />}
        >
          সব সার্ভেয়ার ডিরেক্টরি দেখুন &rarr;
        </Button>
      </div>
    </SectionWrapper>
  );
}
