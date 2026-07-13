import { ClipboardCheck, FileEdit, MessageCircle, UserCheck } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: FileEdit,
    step: "১",
    title: "প্রয়োজন জানান",
    description: "সেবা, জমির অবস্থান ও প্রয়োজনীয় তথ্য দিয়ে request তৈরি করুন।",
  },
  {
    icon: ClipboardCheck,
    step: "২",
    title: "Quotation গ্রহণ করুন",
    description: "আপনার এলাকার সার্ভেয়ারদের প্রস্তাব ও আনুমানিক খরচ দেখুন।",
  },
  {
    icon: UserCheck,
    step: "৩",
    title: "সার্ভেয়ার নির্বাচন করুন",
    description: "অভিজ্ঞতা, verification এবং quotation তুলনা করুন।",
  },
  {
    icon: MessageCircle,
    step: "৪",
    title: "কাজ Track করুন",
    description: "Message ও request status ব্যবহার করে কাজের অগ্রগতি দেখুন।",
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" padding="md">
      <SectionHeading
        badge="কীভাবে কাজ করে"
        title="চার ধাপে জমির কাজ এগিয়ে নিন"
        description="Request পোস্ট করা থেকে কাজ শেষ হওয়া পর্যন্ত পুরো workflow এক জায়গায় পরিচালনা করুন।"
      />
      <div className="mt-12 grid gap-8 md:grid-cols-4">
        {steps.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="relative">
              {/* Connector line - desktop */}
              {i < steps.length - 1 && (
                <div className="absolute left-14 top-6 hidden h-0.5 w-[calc(100%-60px)] bg-border md:block" />
              )}
              <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className="relative shrink-0">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <div className="md:mt-4">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Button size="lg" nativeButton={false} render={<Link href="/post-request" />}>
          কাজ পোস্ট করুন
        </Button>
      </div>
    </SectionWrapper>
  );
}
