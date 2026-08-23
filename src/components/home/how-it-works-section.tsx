import { ClipboardCheck, MessageCircle, UserCheck } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: ClipboardCheck,
    step: "১",
    title: "সার্ভেয়ার দেখুন",
    description: "এলাকার সার্ভেয়ারদের প্রোফাইল, সেবা ও ভেরিফিকেশন status দেখুন।",
  },
  {
    icon: UserCheck,
    step: "২",
    title: "সার্ভেয়ার নির্বাচন করুন",
    description: "অভিজ্ঞতা ও ভেরিফিকেশন দেখে সঠিক পেশাজীবী বেছে নিন।",
  },
  {
    icon: MessageCircle,
    step: "৩",
    title: "কাজ ট্র্যাক করুন",
    description: "WhatsApp-এর মাধ্যমে সরাসরি সার্ভেয়ারের সাথে যোগাযোগ করে কাজের অগ্রগতি দেখুন।",
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" padding="md">
      <SectionHeading
        badge="কীভাবে কাজ করে"
        title="তিন ধাপে জমির কাজ এগিয়ে নিন"
        description="সার্ভেয়ার খোঁজা থেকে কাজ শেষ হওয়া পর্যন্ত পুরো ওয়ার্কফ্লো এক জায়গায় পরিচালনা করুন।"
      />
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="relative">
              {/* Connector line - desktop (column layout, circle centered) */}
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.5rem)] top-6 hidden h-0.5 w-[calc(100%-3rem)] bg-border md:block" />
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
        <Button size="lg" nativeButton={false} render={<Link href="/surveyors" />}>
          সার্ভেয়ার খুঁজুন
        </Button>
      </div>
    </SectionWrapper>
  );
}
