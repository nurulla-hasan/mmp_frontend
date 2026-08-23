import {
  Briefcase,
  Check,
  Home,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const landownerBenefits = [
  "ডিজিটাল ল্যান্ড ও পরিমাপ টুলস ব্যবহার",
  "মৌজা ম্যাপ তুলনা (Pantagraph) ও ট্রেসিং",
  "জেলা ও থানা অনুযায়ী ভেরিফাইড সার্ভেয়ার অনুসন্ধান",
  "সরাসরি ফোন ও WhatsApp-এ সার্ভেয়ার যোগাযোগ",
  "প্লটের ক্যালকুলেশন ও পরিমাপ ক্লাউড সেভ",
  "PDF ও প্রিন্ট-ফ্রেন্ডলি রিপোর্ট তৈরি",
  "উন্মুক্ত ল্যান্ড কমিউনিটি ও প্রশ্নোত্তর ফোরাম",
];

const surveyorBenefits = [
  "প্রফেশনাল পাবলিক প্রোফাইল ও ভেরিফিকেশন ব্যাজ",
  "জেলা ও উপজেলা ভিত্তিক সার্ভিস এরিয়া প্রদর্শন",
  "ক্লায়েন্টদের সরাসরি কাজের কল ও WhatsApp সুযোগ",
  "অ্যাডভান্সড মৌজা ম্যাপ ড্রয়িং ও ডিজিটাল স্টুডিও",
  "ক্লায়েন্টের হিসাব ও প্রজেক্ট ক্লাউডে সংরক্ষণ",
  "সার্ভেয়ার নেটওয়ার্ক ও কমিউনিটি সাপোর্ট",
  "প্রিন্ট-রেডি ফরম্যাটে সার্ভে রিপোর্ট জেনারেশন",
];

export function RoleBenefitsSection() {
  return (
    <SectionWrapper id="benefits">
      <SectionHeading
        badge="সবার জন্য এক প্ল্যাটফর্ম"
        title="জমির মালিক ও সার্ভেয়ার—দুই পক্ষের কাজই সহজ"
        description="জমির নিখুঁত হিসাব-নিকাশ এবং দক্ষ সার্ভেয়ারের পেশাদার সেবাকে এক ছাদের নিচে নিয়ে এসেছে MMP।"
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Landowner card */}
        <div className="h-full rounded-xl transition-all duration-300 hover:shadow-md">
          <Card>
            <CardContent>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Home className="size-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                জমির মালিকদের জন্য
              </h3>
              <ul className="mt-4 space-y-2.5">
                {landownerBenefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-2.5" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/surveyors" />}
                >
                  সার্ভেয়ার খুঁজুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surveyor card */}
        <div className="h-full rounded-xl transition-all duration-300 hover:shadow-md">
          <Card>
            <CardContent>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Briefcase className="size-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                সার্ভেয়ারদের জন্য
              </h3>
              <ul className="mt-4 space-y-2.5">
                {surveyorBenefits.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-2.5" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  className="w-full"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/join-as-surveyor" />}
                >
                  সার্ভেয়ার হিসেবে যোগ দিন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}
