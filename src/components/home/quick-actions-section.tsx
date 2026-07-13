import { ArrowRight, Calculator, ClipboardCheck, Compass, PencilRuler } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    icon: PencilRuler,
    title: "জমির হিসাব করুন",
    description: "জমির মাপ, প্লট ও ক্ষেত্রফলের হিসাব শুরু করুন।",
    href: "/tools",
  },
  {
    icon: Compass,
    title: "সার্ভেয়ার খুঁজুন",
    description: "এলাকা, সেবা ও অভিজ্ঞতা অনুযায়ী পেশাজীবী খুঁজুন।",
    href: "/surveyors",
  },
  {
    icon: ClipboardCheck,
    title: "কাজ পোস্ট করুন",
    description: "আপনার প্রয়োজন লিখে একাধিক quotation গ্রহণ করুন।",
    href: "/post-request",
  },
  {
    icon: Calculator,
    title: "সার্ভেয়ার হিসেবে যোগ দিন",
    description: "Professional profile তৈরি করে নতুন client-এর সঙ্গে যুক্ত হন।",
    href: "/join-as-surveyor",
  },
];

export function QuickActionsSection() {
  return (
    <SectionWrapper id="quick-actions" asSection bg="muted">
      <SectionHeading
        title="আপনি আজ কী করতে চান?"
        description="জমির হিসাব থেকে পেশাদার সেবা—আপনার প্রয়োজন অনুযায়ী সরাসরি শুরু করুন।"
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group transition-all hover:-translate-y-0.5"
            >
              <Card className="transition-all group-hover:ring-primary/30 group-hover:shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-medium">{card.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    শুরু করুন <ArrowRight className="size-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
