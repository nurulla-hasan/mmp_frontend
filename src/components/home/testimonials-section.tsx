import { Home, Quote, Star, UserRound } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    content:
      "এক জায়গায় হিসাব save করা, এলাকার সার্ভেয়ার দেখা এবং quotation তুলনা করার workflow-টি অনেক পরিষ্কার।",
    label: "জমির মালিক",
    roleIcon: Home,
    rating: 5,
  },
  {
    content:
      "Professional profile, available request এবং calculation workspace একই dashboard-এ থাকায় client-এর কাজ পরিচালনা সহজ হবে।",
    label: "Professional Surveyor",
    roleIcon: UserRound,
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials" padding="md">
      <SectionHeading
        badge="ব্যবহারকারীর অভিজ্ঞতা"
        title="জমির কাজ এখন আরও সংগঠিত"
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {testimonials.map((t, i) => {
          const RoleIcon = t.roleIcon;
          return (
            <Card key={i} className="transition-all hover:border-primary/30 hover:shadow-sm">
              <CardContent className="p-6 md:p-7">
                <div className="flex items-start justify-between">
                  <Quote className="size-7 text-primary/20" />
                  <span className="rounded-full border bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Sample Feedback
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                  &ldquo;{t.content}&rdquo;
                </p>
                {/* Decorative stars */}
                <div className="mt-5 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`size-4 ${
                        j < t.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2.5 border-t pt-4">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <RoleIcon className="size-4" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
