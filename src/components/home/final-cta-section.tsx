import { ArrowRight, Briefcase, FileText } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalCtaSection() {
  return (
    <div className="relative overflow-hidden bg-primary/5">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 h-125 w-125 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-100 w-100 translate-y-1/2 -translate-x-1/2 rounded-full bg-yellow-500/15 blur-[100px]" />
      </div>

      <SectionWrapper id="get-started">
      <SectionHeading
        title="জমির কাজ শুরু করতে প্রস্তুত?"
        description="জমির সঠিক মাপজোক করুন, এলাকার সেরা সার্ভেয়ার খুঁজে বের করুন অথবা পেশাদার সার্ভেয়ার হিসেবে আপনার প্রোফাইল তৈরি করুন।"
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Landowner CTA */}
        <Card className="border-primary/10 bg-card/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
          <CardContent>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">জমির কাজ আছে?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              আপনার এলাকার বিশ্বস্ত ও অভিজ্ঞ সার্ভেয়ারদের তালিকা থেকে সরাসরি যোগাযোগ করুন।
            </p>
            <Button
              className="mt-6 w-full"
              size="lg"
              nativeButton={false}
              render={<Link href="/surveyors" />}
            >
              সার্ভেয়ার খুঁজুন
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Surveyor CTA */}
        <Card className="border-primary/10 bg-card/60 backdrop-blur-xl transition-all duration-500 delay-100 hover:-translate-y-1 hover:shadow-2xl">
          <CardContent>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">আপনি একজন সার্ভেয়ার?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              পেশাদার প্রোফাইল তৈরি করে নতুন ক্লায়েন্টদের কাছে সহজেই পৌঁছান এবং আপনার পরিচিতি বাড়ান।
            </p>
            <Button
              className="mt-6 w-full"
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/join-as-surveyor" />}
            >
              সার্ভেয়ার হিসেবে যোগ দিন
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/tools"
          className="text-sm text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
        >
          আগে ল্যান্ড টুলস ব্যবহার করে দেখুন &rarr;
        </Link>
      </div>
      </SectionWrapper>
    </div>
  );
}
