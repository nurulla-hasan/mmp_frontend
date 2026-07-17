import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";

export function PricingCta() {
 return (
 <SectionWrapper padding="lg" bg="primary">
 <div className="relative">
 {/* Background glow */}
 <div className="pointer-events-none absolute inset-0 mx-auto size-80 rounded-full bg-primary/10 " />

 <SectionHeading
 as="h2"
 title="আপনার প্রয়োজন অনুযায়ী শুরু করুন"
 description="বেসিক ল্যান্ড টুলস ব্যবহার করে দেখুন অথবা ক্যালকুলেশন সেভ ও পেশাদার রিপোর্ট-এর জন্য প্রো প্ল্যান নির্বাচন করুন।"
 />

 <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
 <Button
 size="lg"
 nativeButton={false}
 render={<Link href="/register" />}
 >
 ফ্রি অ্যাকাউন্ট খুলুন
 </Button>
 <Button
 size="lg"
 variant="outline"
 nativeButton={false}
 render={<Link href="/tools" />}
 >
 Land Tools দেখুন
 </Button>
 </div>

 <p className="mt-6 text-center">
 <Link
 href="/surveyors"
 className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
 >
 সার্ভেয়ার খুঁজুন &rarr;
 </Link>
 </p>
 </div>
 </SectionWrapper>
 );
}
