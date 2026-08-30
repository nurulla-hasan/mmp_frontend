import { ClipboardCheck, MessageCircle, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: ClipboardCheck,
    step: "০১",
    title: "সার্ভেয়ার খুঁজুন",
    description:
      "আপনার জেলা ও উপজেলা সিলেক্ট করে অভিজ্ঞ সার্ভেয়ারদের রেটিং, সেবা ও কাজের রেট যাচাই করুন।",
    tag: "অনুসন্ধান",
  },
  {
    icon: UserCheck,
    step: "০২",
    title: "পেশাজীবী নির্বাচন করুন",
    description:
      "ভেরিফাইড স্ট্যাটাস, রিভিউ ও অভিজ্ঞতা বিশ্লেষণ করে সেরা পেশাজীবীকে বেছে নিন।",
    tag: "বাছাই",
  },
  {
    icon: MessageCircle,
    step: "০৩",
    title: "সরাসরি যোগাযোগ ও ট্র্যাক",
    description:
      "১-ক্লিকে WhatsApp-এ সরাসরি যোগাযোগ করে জমির পরিমাপ বা সার্ভে কাজের অগ্রগতি পরিচালনা করুন।",
    tag: "কাজ শুরু",
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" padding="md">
      <SectionHeading
        badge="কীভাবে কাজ করে"
        title="তিন সহজ ধাপে জমির কাজ সম্পন্ন করুন"
        description="সার্ভেয়ার খোঁজা থেকে কাজ সম্পন্ন হওয়া পর্যন্ত পুরো প্রক্রিয়াটি অত্যন্ত স্বচ্ছ ও ঝামেলাহীন।"
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3 relative">
        {steps.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-transform duration-200 hover:-translate-y-1 hover:border-primary/40"
            >
              <div>
                {/* Header: Step Badge & Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-heading font-bold text-lg">
                    {item.step}
                  </div>
                  <span className="rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {item.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className="mt-4 hidden lg:flex items-center justify-end text-muted-foreground/40">
                  <ArrowRight className="size-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/surveyors" />}
          className="gap-2 shadow-sm"
        >
          সার্ভেয়ার ডিরেক্টরি দেখুন
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
