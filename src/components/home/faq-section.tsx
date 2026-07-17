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
    a: "জমির হিসাব করা, ক্যালকুলেশন সেভ করা, সার্ভেয়ার খোঁজা, সার্ভিস রিকোয়েস্ট পোস্ট করা, কোটেশন দেখা এবং কাজের স্ট্যাটাস ট্র্যাক করা যাবে।",
  },
  {
    q: "ল্যান্ড টুলস কি বিনামূল্যে ব্যবহার করা যাবে?",
    a: "কিছু বেসিক টুল বিনামূল্যে ব্যবহার করা যাবে। সেভ করা ক্যালকুলেশন, রিপোর্ট এবং অ্যাডভান্সড সুবিধা প্ল্যান অনুযায়ী সীমাবদ্ধ হতে পারে।",
  },
  {
    q: "ক্যালকুলেশন কি পরে আবার খোলা যাবে?",
    a: "লগইন করা ব্যবহারকারী ক্যালকুলেশন প্রজেক্ট সেভ করে পরে আবার খুলে এডিট বা কন্টিনিউ করতে পারবেন。",
  },
  {
    q: "সার্ভেয়ার কীভাবে ভেরিফাইড হবে?",
    a: "সার্ভেয়ার প্রয়োজনীয় পরিচয় ও পেশাদার ডকুমেন্ট জমা দেবেন। অ্যাডমিন রিভিউ-এর পরে ভেরিফিকেশন স্ট্যাটাস দেওয়া হবে।",
  },
  {
    q: "সার্ভিস রিকোয়েস্ট কীভাবে কাজ করবে?",
    a: "আপনি কাজের প্রয়োজন ও লোকেশন দিয়ে রিকোয়েস্ট তৈরি করবেন। সংশ্লিষ্ট সার্ভেয়ার-রা কোটেশন পাঠাতে পারবেন।",
  },
  {
    q: "কোটেশন গ্রহণ করলে কী হবে?",
    a: "একটি কোটেশন নির্বাচন করার পরে রিকোয়েস্ট সিলেক্টেড, শিডিউলড বা ইন-প্রোগ্রেস স্ট্যাটাস-এর মাধ্যমে এগিয়ে যাবে।",
  },
  {
    q: "Mouza Map Pro কি সরকারি প্ল্যাটফর্ম?",
    a: "না। Mouza Map Pro একটি ইন্ডিপেন্ডেন্ট ডিজিটাল ল্যান্ড টুলস এবং পেশাদার সার্ভিস প্ল্যাটফর্ম। সরকারি নথি বা সিদ্ধান্তের জন্য সংশ্লিষ্ট সরকারি কর্তৃপক্ষের তথ্য অনুসরণ করতে হবে।",
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
