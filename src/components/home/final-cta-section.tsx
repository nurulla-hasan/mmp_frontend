import { ArrowRight, Briefcase, FileText } from "lucide-react";
import Link from "next/link";

import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalCtaSection() {
  return (
    <SectionWrapper id="get-started" padding="lg" className="bg-primary/3">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          জমির কাজ শুরু করতে প্রস্তুত?
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground max-w-lg mx-auto">
          হিসাব করুন, প্রয়োজন পোস্ট করুন অথবা professional surveyor হিসেবে
          আপনার profile তৈরি করুন।
        </p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Landowner CTA */}
        <Card className="flex flex-col border-primary/10 bg-primary/5 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex flex-1 flex-col p-6 sm:p-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="size-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">জমির কাজ আছে?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              আপনার প্রয়োজন পোস্ট করুন এবং এলাকার সার্ভেয়ারদের quotation গ্রহণ
              করুন।
            </p>
            <div className="mt-auto pt-6">
              <Button
                className="w-full h-11"
                nativeButton={false}
                render={<Link href="/post-request" />}
              >
                কাজ পোস্ট করুন
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Surveyor CTA */}
        <Card className="flex flex-col border-primary/10 bg-primary/5 transition-all hover:border-primary/30 hover:shadow-md">
          <CardContent className="flex flex-1 flex-col p-6 sm:p-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Briefcase className="size-7" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">আপনি একজন সার্ভেয়ার?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Professional profile তৈরি করে নতুন client এবং available request-এর
              সঙ্গে যুক্ত হন।
            </p>
            <div className="mt-auto pt-6">
              <Button
                className="w-full h-11"
                variant="outline"
                nativeButton={false}
                render={<Link href="/register/surveyor" />}
              >
                Surveyor হিসেবে যোগ দিন
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
        >
          আগে Land Tools ব্যবহার করে দেখুন
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
