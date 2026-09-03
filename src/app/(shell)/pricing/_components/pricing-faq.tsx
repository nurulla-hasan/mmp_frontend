"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "কোন Plan আমার জন্য উপযুক্ত?",
    a: "স্বল্প সময়ের কাজের জন্য Monthly Pro, নিয়মিত কয়েক মাস ব্যবহারের জন্য 6 Months Pro এবং দীর্ঘমেয়াদি professional ব্যবহারের জন্য Yearly Pro বেছে নিতে পারেন।",
  },
  {
    q: "সব Pro plan-এ কি একই feature থাকবে?",
    a: "বর্তমান পরিকল্পনা অনুযায়ী মূল প্রো ফিচারগুলো একই থাকবে। প্ল্যানগুলোর প্রধান পার্থক্য হবে মেয়াদ ও মূল্য। চূড়ান্ত ফিচার তালিকা লঞ্চ-এর আগে প্রকাশ করা হবে।",
  },
  {
    q: "Plan শেষ হলে saved calculation কি মুছে যাবে?",
    a: "সেভ করা ডাটা রিটেনশন এবং মেয়াদোত্তীর্ণ প্ল্যান অ্যাক্সেস পলিসি এখনো ফাইনাল হয়নি। লঞ্চ-এর আগে এই পলিসি পরিষ্কারভাবে প্রকাশ করা হবে।",
  },
  {
    q: "একাধিক device-এ account ব্যবহার করা যাবে?",
    a: "ডিভাইস-ভিত্তিক অ্যাক্সেস পলিসি প্রযোজ্য হবে। সঠিক ডিভাইস লিমিট প্ল্যান এবং লঞ্চ পলিসি অনুযায়ী প্রকাশ করা হবে।",
  },
  {
    q: "Subscription কি auto-renew হবে?",
    a: "অটো-রিনিউয়াল পলিসি এখনো ফাইনাল হয়নি। পেমেন্ট-এর আগে ব্যবহারকারীকে রিনিউয়াল মেথড পরিষ্কারভাবে জানানো হবে。",
  },
  {
    q: "Payment ব্যর্থ হলে কী হবে?",
    a: "পেমেন্ট কনফার্ম না হলে সাবস্ক্রিপশন অ্যাক্টিভ হবে না। পুনরায় পেমেন্ট করার সুযোগ থাকবে。",
  },
  {
    q: "Plan upgrade বা পরিবর্তন করা যাবে?",
    a: "আপগ্রেড, ডাউনগ্রেড এবং অবশিষ্ট সময় অ্যাডজাস্টমেন্ট পলিসি লঞ্চ-এর আগে ফাইনাল করা হবে。",
  },
  {
    q: "Refund পাওয়া যাবে?",
    a: "রিফান্ড এলিজিবিলিটি ও ক্যান্সেলেশন টার্মস লঞ্চ-এর আগে টার্মস অ্যান্ড কন্ডিশনস-এ প্রকাশ করা হবে。",
  },
  {
    q: "Mouza Map Pro কি সরকারি সেবা?",
    a: "না। Mouza Map Pro একটি ইন্ডিপেন্ডেন্ট ডিজিটাল ল্যান্ড টুলস এবং পেশাদার সার্ভিস প্ল্যাটফর্ম।",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper id="pricing-faq" asSection>
      <SectionHeading
        badge="প্রাইসিং FAQ"
        title="Plan নিয়ে সচরাচর জিজ্ঞাসা"
        description="আপনার subscription ও plan সংক্রান্ত যেকোনো প্রশ্নের উত্তর।"
      />
      <div className="mx-auto mt-10 max-w-2xl">
        <Card className="shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
          <CardContent>
            {faqs.map((faq, i) => (
              <Collapsible
                key={i}
                open={openIndex === i}
                onOpenChange={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
                className="border-b last:border-b-0"
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-primary">
                  {faq.q}
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      openIndex === i && "rotate-180",
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-4 text-sm leading-6 text-muted-foreground">
                  {faq.a}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
