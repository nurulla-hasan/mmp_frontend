"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
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
    a: "ডিজিটাল পদ্ধতিতে জমির মাপজোখ ও হিসাব সংরক্ষণ করা, মৌজা ম্যাপ এনালাইসিস করা, ভেরিফাইড দক্ষ সার্ভেয়ার খোঁজা এবং তাদের সাথে সরাসরি যোগাযোগ করে সেবা নেওয়া যাবে।",
  },
  {
    q: "ল্যান্ড টুলস কি বিনামূল্যে ব্যবহার করা যাবে?",
    a: "হ্যাঁ, বেসিক ল্যান্ড টুলস সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়। এছাড়া সেভ করা আনলিমিটেড ক্যালকুলেশন, এইচডি এক্সপোর্ট এবং বিশেষ ফিচারগুলোর জন্য প্রো সুবিধা রয়েছে।",
  },
  {
    q: "ক্যালকুলেশন কি পরে আবার খোলা যাবে?",
    a: "হ্যাঁ, লগইন করা ব্যবহারকারী যেকোনো সময় তাদের সেভ করা প্রজেক্ট ড্যাশবোর্ড থেকে খুলে পুনরায় এডিট বা প্রিন্ট করতে পারবেন।",
  },
  {
    q: "সার্ভেয়ার কীভাবে ভেরিফাইড হবে?",
    a: "সার্ভেয়ার আবেদন জমা দিলে আমাদের অ্যাডমিন টিম তাদের পরিচয়পত্র, সার্ভে সনদ ও অভিজ্ঞতা যাচাই করে ভেরিফিকেশন ব্যাজ প্রদান করে।",
  },
  {
    q: "সার্ভেয়ারদের সাথে কীভাবে যোগাযোগ করব?",
    a: "সার্ভেয়ার ডিরেক্টরি থেকে আপনার এলাকার সার্ভেয়ার নির্বাচন করে তাদের প্রোফাইলে থাকা সরাসরি ফোন নম্বর বা WhatsApp বাটনে ক্লিক করে সাথে সাথে যোগাযোগ করতে পারবেন।",
  },
  {
    q: "Mouza Map Pro কি সরকারি প্ল্যাটফর্ম?",
    a: "না। Mouza Map Pro একটি স্বাধীন ডিজিটাল ল্যান্ড টুলস এবং প্রফেশনাল সার্ভেয়ার নেটওয়ার্ক প্ল্যাটফর্ম। সরকারি চূড়ান্ত নথির জন্য সংশ্লিষ্ট সরকারি ভূমি অফিসের তথ্য অনুসরণ করতে হবে।",
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
