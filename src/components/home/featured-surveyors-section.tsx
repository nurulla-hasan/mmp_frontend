import { BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/ui/custom/star-rating";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const surveyors = [
  {
    name: "মো. আব্দুল করিম",
    location: "দিনাজপুর সদর",
    experience: "৮ বছর",
    rating: 4.8,
    reviews: 42,
    services: ["জমি পরিমাপ", "সীমানা নির্ধারণ"],
    verified: true,
    subscribed: true,
    initials: "আ",
    slug: "abdul-karim",
  },
  {
    name: "মো. রফিকুল ইসলাম",
    location: "রংপুর সদর",
    experience: "৬ বছর",
    rating: 4.7,
    reviews: 31,
    services: ["জমি ভাগ", "ডিজিটাল সার্ভে"],
    verified: true,
    subscribed: false,
    initials: "র",
    slug: "rafiqul-islam",
  },
  {
    name: "মো. সাইফুল হক",
    location: "বগুড়া সদর",
    experience: "১০ বছর",
    rating: 4.9,
    reviews: 56,
    services: ["মৌজা ম্যাপ", "জমি পরিমাপ"],
    verified: true,
    subscribed: true,
    initials: "স",
    slug: "saiful-haque",
  },
];

export function FeaturedSurveyorsSection() {
  return (
    <SectionWrapper id="surveyors" bg="muted">
      <SectionHeading
        badge="পেশাজীবী খুঁজুন"
        title="আপনার এলাকার অভিজ্ঞ সার্ভেয়ারদের সঙ্গে যুক্ত হন"
        description="সেবা, এলাকা, অভিজ্ঞতা ও verification status দেখে সঠিক পেশাজীবী নির্বাচন করুন।"
      />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {surveyors.map((s) => (
          <Card
            key={s.slug}
            className="transition-all hover:ring-primary/30 hover:shadow-sm"
          >
            <CardContent>
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {s.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium">{s.name}</h3>
                    {s.verified && (
                      <BadgeCheck className="size-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {s.location}
                  </div>
                </div>
              </div>
              {/* Experience & rating */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">অভিজ্ঞতা: {s.experience}</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={Math.round(s.rating)} totalStars={1} size={14} />
                  <span className="font-medium">{s.rating}</span>
                  <span className="text-muted-foreground">({s.reviews})</span>
                </div>
              </div>
              {/* Service badges */}
              <div className="mt-3 flex flex-wrap gap-1">
                {s.services.map((svc) => (
                  <span
                    key={svc}
                    className="rounded-md bg-primary/5 px-2 py-0.5 text-xs text-primary"
                  >
                    {svc}
                  </span>
                ))}
              </div>
              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href={`/surveyors/${s.slug}`} />}
                >
                  প্রোফাইল দেখুন
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href={`/post-request?surveyor=${s.slug}`} />}
                >
                  Quotation চান
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button variant="outline" nativeButton={false} render={<Link href="/surveyors" />}>
          সব সার্ভেয়ার দেখুন &rarr;
        </Button>
      </div>
    </SectionWrapper>
  );
}
