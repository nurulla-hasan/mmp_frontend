import { ArrowRight, Calculator, ClipboardCheck, Compass, PencilRuler } from "lucide-react";
import Link from "next/link";

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
    href: "/register/surveyor",
  },
];

export function QuickActionsSection() {
  return (
    <SectionWrapper id="quick-actions" asSection padding="sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">আপনি আজ কী করতে চান?</h2>
        <p className="mt-2 text-base text-muted-foreground">
          জমির হিসাব থেকে পেশাদার সেবা—আপনার প্রয়োজন অনুযায়ী সরাসরি শুরু করুন।
        </p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group transition-all hover:-translate-y-1"
            >
              <Card className="h-full transition-all group-hover:border-primary/30 group-hover:shadow-md">
                <CardContent className="flex flex-col p-5 md:p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    শুরু করুন <ArrowRight className="size-4" />
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
