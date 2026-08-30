import { ArrowRight, Briefcase, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalCtaSection() {
  return (
    <div className="relative overflow-hidden bg-muted/40 border-t border-border/60">
      <SectionWrapper id="get-started">
        <SectionHeading
          badge="শুরু করুন"
          title="জমির কাজ শুরু করতে প্রস্তুত?"
          description="জমির সঠিক মাপজোক করুন, এলাকার সেরা সার্ভেয়ার খুঁজে বের করুন অথবা পেশাদার সার্ভেয়ার হিসেবে আপনার প্রোফাইল তৈরি করুন।"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* 1. Landowner CTA Card */}
          <Card className="border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
            <CardContent className="flex flex-col justify-between h-full">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <FileText className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  জমির পরিমাপ বা সার্ভে সেবা প্রয়োজন?
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">
                  আপনার এলাকার বিশ্বস্ত ও ভেরিফাইড সার্ভেয়ারদের ডিরেক্টরি থেকে সরাসরি যোগাযোগ করুন এবং দ্রুত কোটেশন পান।
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <Button
                  className="w-full gap-2 shadow-xs"
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/surveyors" />}
                >
                  সার্ভেয়ার খুঁজুন
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. Surveyor CTA Card */}
          <Card className="border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md">
            <CardContent className="flex flex-col justify-between h-full">
              <div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                  <Briefcase className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  আপনি কি একজন অভিজ্ঞ সার্ভেয়ার?
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">
                  Mouza Map Pro-তে প্রফেশনাল প্রোফাইল তৈরি করে সারাদেশে আপনার ব্র্যান্ডিং বাড়ান এবং সরাসরি নতুন ক্লায়েন্ট পান।
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/join-as-surveyor" />}
                >
                  সার্ভেয়ার হিসেবে যোগ দিন
                  <Sparkles className="size-4 text-primary" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            আগে ফ্রি ল্যান্ড টুলস ব্যবহার করে দেখুন
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
