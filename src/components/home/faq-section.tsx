"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Mouza Map Pro দিয়ে কী করা যাবে?",
    a: "জমির হিসাব করা, calculation save করা, সার্ভেয়ার খোঁজা, service request পোস্ট করা, quotation দেখা এবং কাজের status track করা যাবে।",
  },
  {
    q: "Land tools কি বিনামূল্যে ব্যবহার করা যাবে?",
    a: "কিছু basic tool বিনামূল্যে ব্যবহার করা যাবে। Saved calculation, report এবং advanced সুবিধা plan অনুযায়ী সীমাবদ্ধ হতে পারে।",
  },
  {
    q: "Calculation কি পরে আবার খোলা যাবে?",
    a: "Login করা ব্যবহারকারী calculation project save করে পরে আবার খুলে edit বা continue করতে পারবেন।",
  },
  {
    q: "Surveyor কীভাবে verified হবে?",
    a: "Surveyor প্রয়োজনীয় পরিচয় ও professional document জমা দেবেন। Admin review-এর পরে verification status দেওয়া হবে।",
  },
  {
    q: "Service request কীভাবে কাজ করবে?",
    a: "আপনি কাজের প্রয়োজন ও location দিয়ে request তৈরি করবেন। সংশ্লিষ্ট surveyor-রা quotation পাঠাতে পারবেন।",
  },
  {
    q: "Quotation গ্রহণ করলে কী হবে?",
    a: "একটি quotation নির্বাচন করার পরে request selected, scheduled বা in-progress status-এর মাধ্যমে এগিয়ে যাবে।",
  },
  {
    q: "Mouza Map Pro কি সরকারি platform?",
    a: "না। Mouza Map Pro একটি independent digital land tools এবং professional service platform। সরকারি নথি বা সিদ্ধান্তের জন্য সংশ্লিষ্ট সরকারি কর্তৃপক্ষের তথ্য অনুসরণ করতে হবে।",
  },
];

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onToggle} className="border-b last:border-b-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-primary">
        {question}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4 text-sm leading-6 text-muted-foreground">
        {answer}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper id="faq" >
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          badge="FAQ"
          title="সচরাচর জিজ্ঞাসা"
        />
        <Card className="mt-8">
          <CardContent>
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                question={faq.q}
                answer={faq.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
