import {
  Briefcase,
  Home,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const landownerBenefits = [
  "ল্যান্ড টুলস ব্যবহার",
  "ক্যালকুলেশন সংরক্ষণ",
  "সার্ভেয়ার খোঁজা",
  "সার্ভিস রিকোয়েস্ট পোস্টিং",
  "কোটেশন তুলনা",
  "সরাসরি মেসেজিং",
  "রিকোয়েস্ট স্ট্যাটাস ট্র্যাকিং",
];

const surveyorBenefits = [
  "প্রফেশনাল পাবলিক প্রোফাইল",
  "ভেরিফিকেশন ব্যাজ",
  "সার্ভিস ও সার্ভিস এরিয়া",
  "উপলব্ধ রিকোয়েস্ট দেখা",
  "কোটেশন জমা দেওয়া",
  "ক্লায়েন্ট ক্যালকুলেশন ম্যানেজমেন্ট",
  "সরাসরি মেসেজিং",
]

export function RoleBenefitsSection() {
  return (
    <SectionWrapper id="benefits" >
      <SectionHeading
        badge="সবার জন্য এক প্ল্যাটফর্ম"
        title="জমির মালিক ও সার্ভেয়ার—দুই পক্ষের কাজই সহজ"
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Landowner card */}
        <Card className="border-primary/10 transition-all hover:ring-primary/30 hover:shadow-sm">
          <CardContent>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Home className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">জমির মালিকদের জন্য</h3>
            <ul className="mt-4 space-y-2.5">
              {landownerBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="size-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              nativeButton={false}
              render={<Link href="/post-request" />}
            >
              কাজ পোস্ট করুন
            </Button>
          </CardContent>
        </Card>

        {/* Surveyor card */}
        <Card className="border-primary/10 transition-all hover:ring-primary/30 hover:shadow-sm">
          <CardContent>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">সার্ভেয়ারদের জন্য</h3>
            <ul className="mt-4 space-y-2.5">
              {surveyorBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="size-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant="outline"
              nativeButton={false}
              render={<Link href="/join-as-surveyor" />}
            >
              সার্ভেয়ার হিসেবে যোগ দিন
            </Button>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
