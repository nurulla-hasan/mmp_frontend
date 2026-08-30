import {
  ArrowRight,
  Calculator,
  Compass,
  PencilRuler,
  Table2,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    icon: PencilRuler,
    title: "সব জরিপ টুল",
    description:
      "পলিগন ট্রেসার, প্যান্টাগ্রাফ ও জমির মাপ—তিনটি ডিজিটাল টুল একসাথে ব্যবহার করুন।",
    href: "/tools",
    tag: "ডিজিটাল টুলস",
    accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40",
  },
  {
    icon: Compass,
    title: "সার্ভেয়ার খুঁজুন",
    description:
      "এলাকা, সেবা ও অভিজ্ঞতা অনুযায়ী আপনার বিশ্বস্ত পেশাজীবী সার্ভেয়ার নির্বাচন করুন।",
    href: "/surveyors",
    tag: "ডিরেক্টরি",
    accent: "text-blue-500 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40",
  },
  {
    icon: Calculator,
    title: "সার্ভেয়ার হিসেবে যোগ দিন",
    description:
      "পেশাদার প্রোফাইল তৈরি করে সারাদেশে নতুন ক্লায়েন্টদের সঙ্গে সরাসরি যুক্ত হন।",
    href: "/join-as-surveyor",
    tag: "ক্যারিয়ার ও আয়",
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40",
  },
  {
    icon: Table2,
    title: "আমার ক্যালকুলেশন",
    description:
      "আপনার সংরক্ষিত হিসাব ও প্রজেক্ট দেখুন এবং যেকোনো সময় কাজ শুরু করুন।",
    href: "/calculations",
    tag: "ওয়ার্কস্পেস",
    accent: "text-purple-500 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40",
  },
];

export function QuickActionsSection() {
  return (
    <SectionWrapper id="quick-actions" asSection bg="muted">
      <SectionHeading
        title="আপনি আজ কী করতে চান?"
        description="জমির হিসাব থেকে পেশাদার সেবা—আপনার প্রয়োজন অনুযায়ী সরাসরি শুরু করুন।"
      />
      <div className="mt-8 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group block transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
            >
              <Card className="h-full border border-border/80 bg-card transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md">
                <CardContent className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div
                        className={`flex size-11 items-center justify-center rounded-xl border transition-colors ${card.accent}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-sm bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">
                      শুরু করুন
                    </span>
                    <ArrowRight className="size-3.5 text-primary transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
