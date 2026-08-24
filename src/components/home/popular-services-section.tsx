import {
  Compass,
  FileText,
  LandPlot,
  Map,
  MapPinned,
  Ruler,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Ruler,
    title: "জমি পরিমাপ",
    description: "প্লটের সঠিক মাপ ও ক্ষেত্রফল নির্ধারণ করুন।",
    slug: "land-measurement",
  },
  {
    icon: LandPlot,
    title: "জমি ভাগ-বাটোয়ারা",
    description: "ভাগ জমির সঠিক বণ্টন ও আলাদা প্লট গণনা করুন।",
    slug: "land-division",
  },
  {
    icon: Map,
    title: "সীমানা নির্ধারণ",
    description: "জমির সঠিক সীমানা ও সীমানা পিলার চিহ্নিত করুন।",
    slug: "boundary-determination",
  },
  {
    icon: MapPinned,
    title: "ডিজিটাল সার্ভে",
    description: "আধুনিক ডিজিটাল পদ্ধতিতে জরিপ সম্পন্ন করুন।",
    slug: "digital-survey",
  },
  {
    icon: FileText,
    title: "মৌজা ম্যাপ সহায়তা",
    description: "মৌজা ম্যাপ বুঝতে ও তথ্য সংগ্রহে সাহায্য নিন।",
    slug: "mouza-map",
  },
  {
    icon: Compass,
    title: "পরিমাপ রিপোর্ট প্রস্তুতি",
    description: "জরিপকৃত জমির পূর্ণাঙ্গ রিপোর্ট তৈরি করুন।",
    slug: "measurement-report",
  },
];

export function PopularServicesSection() {
  return (
    <SectionWrapper id="services" bg="muted">
      <SectionHeading
        badge="জনপ্রিয় সেবা"
        title="জমির কাজে যে সেবাগুলো সবচেয়ে বেশি প্রয়োজন"
        description="আপনার প্রয়োজনীয় সেবা নির্বাচন করে সংশ্লিষ্ট সার্ভেয়ার খুঁজুন অথবা সরাসরি রিকোয়েস্ট পোস্ট করুন。"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.slug}
              href={`/surveyors?service=${service.slug}`}
              className="group transition-all hover:-translate-y-0.5"
            >
              <Card className="transition-all group-hover:ring-primary/30 group-hover:shadow-sm">
                <CardContent>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-3 font-medium">{service.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {service.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    সার্ভেয়ার খুঁজুন &rarr;
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Button variant="outline" nativeButton={false} render={<Link href="/surveyors" />}>
          সব সেবা দেখুন &rarr;
        </Button>
      </div>
    </SectionWrapper>
  );
}
