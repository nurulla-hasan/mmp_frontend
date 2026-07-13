import { ArrowRight, Briefcase, FileText } from "lucide-react";
import Link from "next/link";

import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalCtaSection() {
  return (
    <SectionWrapper id="get-started" padding="lg">
      <div className="text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          জমির কাজ শুরু করতে প্রস্তুত?
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          হিসাব করুন, প্রয়োজন পোস্ট করুন অথবা professional surveyor হিসেবে আপনার
          profile তৈরি করুন।
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Landowner CTA */}
        <Card className="border-primary/10 bg-primary/5 transition-all hover:shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">জমির কাজ আছে?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              আপনার প্রয়োজন পোস্ট করুন এবং এলাকার সার্ভেয়ারদের quotation গ্রহণ
              করুন।
            </p>
            <Button
              className="mt-6 w-full"
              size="lg"
              nativeButton={false}
              render={<Link href="/post-request" />}
            >
              কাজ পোস্ট করুন
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Surveyor CTA */}
        <Card className="border-primary/10 bg-primary/5 transition-all hover:shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">আপনি একজন সার্ভেয়ার?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Professional profile তৈরি করে নতুন client এবং available request-এর
              সঙ্গে যুক্ত হন।
            </p>
            <Button
              className="mt-6 w-full"
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/register/surveyor" />}
            >
              Surveyor হিসেবে যোগ দিন
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
          আগে Land Tools ব্যবহার করে দেখুন &rarr;
        </Link>
      </div>
    </SectionWrapper>
  );
}
