"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { communityFaqs } from "@/app/(public)/community/_data";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent>
          {communityFaqs.map((faq, i) => (
            <Collapsible
              key={i}
              open={openIndex === i}
              onOpenChange={() => setOpenIndex(openIndex === i ? null : i)}
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
  );
}
