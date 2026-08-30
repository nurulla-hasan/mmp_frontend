import { Quote, UserRound } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/common/star-rating";
import { Badge } from "@/components/ui/badge";
import type { TTestimonial } from "@/interface/surveyor-profile";

const defaultFeedback = [
  {
    id: "def-1",
    reviewerName: "ইঞ্জি. মো. তানভীর",
    reviewerDistrict: "ঢাকা",
    surveyorName: "মো. আব্দুল করিম",
    serviceName: "জমি পরিমাপ ও দাগ শনাক্ত",
    comment:
      "মৌজা ম্যাপ প্রোর মাধ্যমে নিখুঁত পরিমাপ পেয়েছি। সার্ভেয়ারের প্রফেশনালিজম এবং ডিজিটাল রিপোর্টিং পদ্ধতি অসাধারণ।",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "def-2",
    reviewerName: "মো. কামরুল হাসান",
    reviewerDistrict: "দিনাজপুর",
    surveyorName: "মো. রফিকুল ইসলাম",
    serviceName: "সীমানা ও বাটোয়ারা সার্ভে",
    comment:
      "খুব দ্রুত সার্ভেয়ারের সাথে WhatsApp-এ কথা বলে জমি পরিমাপের কাজ সম্পন্ন করতে পেরেছি। কোনো প্রকার মধ্যস্বত্বভোগী ঝামেলা নেই।",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
];

export function TestimonialsSection({
  testimonials = [],
}: {
  testimonials?: TTestimonial[];
}) {
  const displayItems =
    testimonials && testimonials.length > 0 ? testimonials : defaultFeedback;

  return (
    <SectionWrapper id="testimonials" bg="muted">
      <SectionHeading
        badge="ব্যবহারকারীর অভিজ্ঞতা"
        title="জমির কাজে সেবাগ্রহীতাদের মতামত"
        description="প্ল্যাটফর্মের ভেরিফাইড সার্ভেয়ারদের কাছ থেকে সেবা নিয়ে সেবাগ্রহীতারা কী বলছেন।"
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {displayItems.map((t) => (
          <Card
            key={t.id}
            className="border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
          >
            <CardContent className="flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Quote className="size-5 text-primary/40" />
                  <StarRating rating={t.rating} size={13} />
                </div>

                <p className="text-xs sm:text-sm leading-6 text-foreground/90 italic">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-foreground">
                      {t.reviewerName}
                    </h4>
                    {t.reviewerDistrict && (
                      <p className="text-[10px] text-muted-foreground">
                        {t.reviewerDistrict}
                      </p>
                    )}
                  </div>
                </div>

                {t.serviceName && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    {t.serviceName}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
