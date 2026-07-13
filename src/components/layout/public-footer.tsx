import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export function PublicFooter() {
  return (
    <footer className="border-t bg-card">
      <SectionWrapper padding="sm" spacing={false} className="flex flex-col md:flex-row justify-between gap-12">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            বাংলাদেশের আমিন ও জরিপকারীদের জন্য সবচেয়ে সহজ ডিজিটাল ভূমি পরিমাপ সিস্টেম।
          </p>
        </div>
        
        <div className="flex flex-wrap gap-12 md:gap-24">
          <div className="flex flex-col gap-3 text-sm font-medium text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">অন্বেষণ (Explore)</h2>
            <Link href="/tools" className="hover:text-primary transition-colors">ভূমি পরিমাপ টুলস</Link>
            <Link href="/surveyors" className="hover:text-primary transition-colors">সার্ভেয়ার খুঁজুন</Link>
            <Link href="/service-guides" className="hover:text-primary transition-colors">সেবা নির্দেশিকা</Link>
          </div>
          
          <div className="flex flex-col gap-3 text-sm font-medium text-muted-foreground">
            <h2 className="text-base font-semibold text-foreground">কোম্পানি (Company)</h2>
            <Link href="/about" className="hover:text-primary transition-colors">আমাদের সম্পর্কে</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">যোগাযোগ</Link>
            <Link href="/fraud-awareness" className="hover:text-primary transition-colors">প্রতারণা সতর্কতা</Link>
          </div>
        </div>
      </SectionWrapper>
      
      <div className="border-t border-border/50 py-6">
        <SectionWrapper padding="sm" spacing={false} className="mx-auto max-w-4xl space-y-3 text-center text-xs text-muted-foreground">
          <p>
            <strong className="font-semibold">নোট:</strong> Mouza Map Pro একটি ডিজিটাল পরিমাপ সহায়ক টুল। এর পরিমাপ আইনি বা সরকারি চূড়ান্ত পরিমাপের বিকল্প নয়। যেকোনো চূড়ান্ত আইনি কাজে অনুমোদিত সরকারি জরিপ ও কর্তৃপক্ষের যাচাই বাধ্যতামূলক।
          </p>
          <p className="font-medium text-foreground">
            &copy; {new Date().getFullYear()} Mouza Map Pro. All rights reserved.
          </p>
        </SectionWrapper>
      </div>
    </footer>
  );
}
