import { Briefcase, Home } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const landownerBenefits = [
  "জমির measurement tools",
  "Calculation সংরক্ষণ",
  "সার্ভেয়ার খোঁজা",
  "সার্ভিস request পোস্টিং",
  "Quotation তুলনা",
  "সরাসরি মেসেজিং",
  "Request status tracking",
];

const surveyorBenefits = [
  "পেশাদার পাবলিক প্রোফাইল",
  "Verification ব্যাজ",
  "সেবা ও সেবা এলাকা নির্ধারণ",
  "নতুন request আবিষ্কার",
  "Quotation জমা দেওয়া",
  "ক্লায়েন্ট calculation ব্যবস্থাপনা",
  "সরাসরি মেসেজিং",
];

export function RoleBenefitsSection() {
  return (
    <SectionWrapper id="benefits" padding="md">
      <SectionHeading
        badge="সবার জন্য এক প্ল্যাটফর্ম"
        title="জমির মালিক ও সার্ভেয়ার—দুই পক্ষের কাজই সহজ"
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Landowner card */}
        <Card className="flex flex-col border-primary/10 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex flex-1 flex-col p-6 md:p-7">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Home className="size-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">জমির মালিকদের জন্য</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              আপনার জমির সব কাজ এক জায়গায়—টুলস, সার্ভেয়ার, ও হিসাব।
            </p>
            <ul className="mt-5 space-y-3">
              {landownerBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="size-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <Button
                className="w-full h-10 md:h-11"
                nativeButton={false}
                render={<Link href="/post-request" />}
              >
                কাজ পোস্ট করুন
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Surveyor card */}
        <Card className="flex flex-col border-primary/10 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex flex-1 flex-col p-6 md:p-7">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Briefcase className="size-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">সার্ভেয়ারদের জন্য</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              আপনার পেশাদার প্রোফাইল তৈরি করুন ও নতুন ক্লায়েন্ট খুঁজুন।
            </p>
            <ul className="mt-5 space-y-3">
              {surveyorBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="size-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6">
              <Button
                className="w-full h-10 md:h-11"
                variant="outline"
                nativeButton={false}
                render={<Link href="/register/surveyor" />}
              >
                সার্ভেয়ার হিসেবে যোগ দিন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
