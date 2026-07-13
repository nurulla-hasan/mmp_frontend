import { Quote, Star } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    content:
      "এক জায়গায় হিসাব save করা, এলাকার সার্ভেয়ার দেখা এবং quotation তুলনা করার workflow-টি অনেক পরিষ্কার।",
    role: "জমির মালিক — Sample feedback",
    rating: 5,
  },
  {
    content:
      "Professional profile, available request এবং calculation workspace একই dashboard-এ থাকায় client-এর কাজ পরিচালনা সহজ হবে।",
    role: "Professional Surveyor — Sample feedback",
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
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Quote className="mb-3 size-6 text-primary/30" />
              <p className="text-sm leading-6 text-muted-foreground">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`size-3.5 ${
                      j < t.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
