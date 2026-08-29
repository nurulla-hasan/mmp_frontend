import { MessageCircle, BadgeCheck, CalendarDays, MapPin, Briefcase } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getInitials, toBengaliDigits } from "@/lib/utils";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";
import { StarRating } from "@/components/common/star-rating";

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
  const fullName = surveyor.user?.name || surveyor.fullName || "সার্ভেয়ার";
  const profilePhoto = surveyor.user?.imageUrl || surveyor.profilePhoto || "";
  const isSubscribed = surveyor.user?.isSubscribed ?? surveyor.isSubscribed ?? false;
  const isVerified = surveyor.isVerified ?? surveyor.verificationStatus === "APPROVED";
  const whatsappNumber = surveyor.user?.whatsappNumber || surveyor.whatsappNumber || "";
  const primaryDistrict =
    surveyor.user?.district ||
    surveyor.primaryLocation?.district ||
    surveyor.serviceAreas?.[0]?.district ||
    "";
  const primaryUpazila =
    surveyor.user?.upazila ||
    surveyor.primaryLocation?.upazila ||
    surveyor.serviceAreas?.[0]?.upazilas?.[0] ||
    "";
  const experienceYears = surveyor.experienceYears ?? 0;
  const joinedAt = surveyor.user?.createdAt || surveyor.createdAt || surveyor.joinedAt || "";
  const rating = surveyor.rating ?? 0;
  const totalReviews = surveyor.totalReviews ?? 0;

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-start md:gap-8 md:p-8">
      {/* Avatar */}
      <div className="flex shrink-0 justify-center md:block">
        <div className="relative size-20 md:size-24">
          <Avatar
            className={cn(
              "size-20 md:size-24",
              isSubscribed &&
                "bg-conic from-violet-500 via-green-500 to-red-500 p-0.5",
            )}
          >
            <AvatarImage
              src={profilePhoto}
              alt={fullName}
            />
            <AvatarFallback className="text-xl md:text-2xl">
              {getInitials(fullName)}
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
                {fullName}
              </h1>
              {isVerified && (
                <Badge variant="success" className="gap-1">
                  <BadgeCheck className="size-3.5" />
                  ভেরিফাইড
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-base font-medium text-muted-foreground">
              {surveyor.headline || "পেশাদার ভূমি জরিপকারী"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground md:text-base">
              {(primaryDistrict || primaryUpazila) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" />
                  {[primaryUpazila, primaryDistrict].filter(Boolean).join(", ")}
                </span>
              )}
              {experienceYears > 0 && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="size-4 text-primary" />
                  {toBengaliDigits(experienceYears)} বছর অভিজ্ঞতা
                </span>
              )}
              {joinedAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {formatJoinDate(joinedAt)} থেকে সক্রিয়
                </span>
              )}
            </div>
          </div>

          {/* Rating / New Badge */}
          {rating > 0 ? (
            <div className="shrink-0 rounded-xl border border-border/70 bg-muted/40 px-4 py-2.5 text-center">
              <div className="flex items-center gap-1 text-lg font-bold">
                <StarRating rating={Math.round(rating)} totalStars={1} />
                <span>{toBengaliDigits(rating.toFixed(1))}</span>
              </div>
              <p className="whitespace-nowrap text-xs text-muted-foreground">
                {toBengaliDigits(totalReviews)} টি রিভিউ
              </p>
            </div>
          ) : (
            <div className="shrink-0 rounded-xl border border-border/70 bg-muted/40 px-4 py-2.5 text-center space-y-1">
              <div>
                <Badge variant="info">নতুন সার্ভেয়ার</Badge>
              </div>
              <p className="whitespace-nowrap text-xs text-muted-foreground">
                এখনো রিভিউ নেই
              </p>
            </div>
          )}
        </div>

        {/* Bio */}
        {surveyor.bio && (
          <p className="max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
            {surveyor.bio}
          </p>
        )}

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          {whatsappNumber ? (
            <Button
              size="lg"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/880${whatsappNumber.replace(/^0/, "")}?text=${encodeURIComponent(`হ্যালো, আমি Mouza Map Pro থেকে দেখছি। ${fullName} এর সেবা সম্পর্কে জানতে চাই।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle className="size-5" />
              WhatsApp-এ যোগাযোগ
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              সার্ভেয়ার এখনো যোগাযোগের মাধ্যম নির্ধারণ করেননি।
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
