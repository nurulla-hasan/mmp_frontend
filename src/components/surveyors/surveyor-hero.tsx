import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { TSurveyorProfile } from "@/types/surveyor-profile.type";
import { StarRating } from "../ui/custom/star-rating";

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    month: "long",
    year: "numeric",
  });
}

export function SurveyorHero({
  surveyor,
}: {
  surveyor: TSurveyorProfile;
}) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-start md:gap-8 md:p-8">
      {/* Avatar */}
      <div className="flex shrink-0 justify-center md:block">
        <div className="relative size-20 md:size-24">
          <Avatar className="size-20 md:size-24">
            {surveyor.profilePhoto ? (
              <AvatarImage
                src={surveyor.profilePhoto}
                alt={surveyor.fullName}
              />
            ) : null}
            <AvatarFallback className="text-xl md:text-2xl">
              {getInitials(surveyor.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold font-heading md:text-3xl">
                {surveyor.fullName}
              </h1>
              {surveyor.isVerified && (
                <span title="Mouza Map Pro verified profile">
                  <BadgeCheck className="size-6 shrink-0 text-primary" />
                </span>
              )}
            </div>
            <p className="mt-1.5 text-base font-medium text-muted-foreground">
              {surveyor.headline}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground md:text-base">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {surveyor.primaryLocation.upazila},{" "}
                {surveyor.primaryLocation.district}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatJoinDate(surveyor.joinedAt)} থেকে সক্রিয়
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="shrink-0 rounded-xl border border-border/70 bg-muted/40 px-4 py-2.5 text-center">
            <div className="flex items-center gap-1 text-lg font-bold">
              <StarRating rating={surveyor.rating} totalStars={1} />
              <span>{surveyor.rating.toFixed(1)}</span>
            </div>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              {surveyor.totalReviews} টি {surveyor.reviews?.length > 0 && surveyor.reviews.every((r) => r.isVerifiedService) ? "যাচাইকৃত " : ""}রিভিউ
            </p>
          </div>
        </div>

        {/* Bio */}
        {surveyor.bio && (
          <p className="max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
            {surveyor.bio}
          </p>
        )}

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={
              <Link href={`/post-request?surveyor=${surveyor.slug}`} />
            }
          >
            সার্ভেয়ারকে কাজের অনুরোধ পাঠান
          </Button>
        </div>
      </div>
    </section>
  );
}
