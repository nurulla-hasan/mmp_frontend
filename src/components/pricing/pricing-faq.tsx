"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
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
    a: "বর্তমান পরিকল্পনা অনুযায়ী মূল Pro featureগুলো একই থাকবে। Planগুলোর প্রধান পার্থক্য হবে মেয়াদ ও মূল্য। Final feature list launch-এর আগে প্রকাশ করা হবে।",
  },
  {
    q: "Plan শেষ হলে saved calculation কি মুছে যাবে?",
    a: "Saved data retention এবং expired plan access policy এখনো final হয়নি। Launch-এর আগে এই policy পরিষ্কারভাবে প্রকাশ করা হবে।",
  },
  {
    q: "একাধিক device-এ account ব্যবহার করা যাবে?",
    a: "Device-based access policy প্রযোজ্য হবে। Exact device limit plan এবং launch policy অনুযায়ী প্রকাশ করা হবে।",
  },
  {
    q: "Subscription কি auto-renew হবে?",
    a: "Auto-renewal policy এখনো final হয়নি। Payment-এর আগে user-কে renewal method পরিষ্কারভাবে জানানো হবে।",
  },
  {
    q: "Payment ব্যর্থ হলে কী হবে?",
    a: "Payment confirm না হলে subscription active হবে না। পুনরায় payment করার সুযোগ থাকবে।",
  },
  {
    q: "Plan upgrade বা পরিবর্তন করা যাবে?",
    a: "Upgrade, downgrade এবং remaining-duration adjustment policy launch-এর আগে final করা হবে।",
  },
  {
    q: "Refund পাওয়া যাবে?",
    a: "Refund eligibility ও cancellation terms launch-এর আগে Terms and Conditions-এ প্রকাশ করা হবে।",
  },
  {
    q: "Mouza Map Pro কি সরকারি সেবা?",
    a: "না। Mouza Map Pro একটি independent digital land tools এবং professional service platform।",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper id="pricing-faq" asSection>
      <SectionHeading
        badge="Pricing FAQ"
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
