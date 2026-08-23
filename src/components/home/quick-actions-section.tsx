import { ArrowRight, Calculator, Compass, PencilRuler, Table2 } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    icon: PencilRuler,
    title: "সব জরিপ টুল",
    description: "পলিগন ট্রেসার, প্যান্টাগ্রাফ ও জমির মাপ—তিনটি টুল একসাথে ব্যবহার করুন।",
    href: "/tools",
  },
  {
    icon: Compass,
    title: "সার্ভেয়ার খুঁজুন",
    description: "এলাকা, সেবা ও অভিজ্ঞতা অনুযায়ী পেশাজীবী খুঁজুন।",
    href: "/surveyors",
  },
  {

    icon: Calculator,
    title: "সার্ভেয়ার হিসেবে যোগ দিন",
    description: "পেশাদার প্রোফাইল তৈরি করে নতুন ক্লায়েন্ট-এর সঙ্গে যুক্ত হন।",
    href: "/join-as-surveyor",
  },
  {
    icon: Table2,
    title: "আমার ক্যালকুলেশন",
    description: "সংরক্ষিত হিসাব ও প্রজেক্ট দেখুন এবং নতুন কাজ শুরু করুন।",
    href: "/calculations",
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
                <CardContent>
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
