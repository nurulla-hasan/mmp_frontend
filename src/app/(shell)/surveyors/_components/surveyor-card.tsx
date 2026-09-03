"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Briefcase, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/common/star-rating";
import { Button } from "@/components/ui/button";
import { cn, getInitials, toBengaliDigits } from "@/lib/utils";
import type {
  TSurveyorProfile,
  TSurveyorServiceWithPrice,
} from "@/interface/surveyor-profile";

export type TSurveyorCard = TSurveyorProfile;

export function SurveyorCard({ surveyor }: { surveyor: TSurveyorProfile }) {
  const fullName = surveyor.user?.name || surveyor.fullName || "সার্ভেয়ার";
  const profilePhoto = surveyor.user?.imageUrl || surveyor.profilePhoto || "";
  const isSubscribed =
    surveyor.user?.isSubscribed ?? surveyor.isSubscribed ?? false;
  const isVerified =
    surveyor.isVerified ?? surveyor.verificationStatus === "APPROVED";
  const whatsappNumber =
    surveyor.user?.whatsappNumber || surveyor.whatsappNumber || "";
  const services: TSurveyorServiceWithPrice[] = surveyor.surveyorServices ?? [];
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
  const rating = surveyor.rating ?? 0;
  const totalReviews = surveyor.totalReviews ?? 0;

  // Minimum starting price among all offered services
  const pricedServices = services.filter(
    (s) => s.startingPrice != null && s.startingPrice > 0,
  );
  const minPrice =
    pricedServices.length > 0
      ? Math.min(...pricedServices.map((s) => s.startingPrice!))
      : null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
      {/* ── Top Header: Avatar + Info + Rating ──────────────── */}
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <Link href={`/surveyors/${surveyor.slug}`} className="shrink-0">
            <div className="relative size-14 md:size-16">
              <Avatar
                isPro={isSubscribed}
                className="size-full transition-transform duration-300 group-hover:scale-105"
              >
                <AvatarImage
                  src={profilePhoto}
                  alt={fullName}
                  className="size-full object-cover"
                />
                <AvatarFallback className="size-full text-base font-medium">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              <Link
                href={`/surveyors/${surveyor.slug}`}
                className="flex items-center gap-1.5 min-w-0 truncate"
              >
                <h3 className="truncate font-semibold font-heading text-base text-foreground transition-colors group-hover:text-primary">
                  {fullName}
                </h3>
                {isVerified && (
                  <BadgeCheck className="size-4 shrink-0 text-primary" />
                )}
              </Link>

              {/* Rating / New badge */}
              {rating > 0 ? (
                <div className="flex items-center gap-1 shrink-0 rounded-md bg-muted/60 px-1.5 py-0.5">
                  <StarRating
                    rating={Math.round(rating)}
                    totalStars={1}
                    size={12}
                  />
                  <span className="font-semibold text-xs text-foreground">
                    {toBengaliDigits(rating.toFixed(1))}
                  </span>
                  {totalReviews > 0 && (
                    <span className="text-muted-foreground text-xs">
                      ({toBengaliDigits(totalReviews)})
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="info">নতুন</Badge>
              )}
            </div>

            {surveyor.headline && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {surveyor.headline}
              </p>
            )}

            {/* Location & Experience Meta */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {(primaryDistrict || primaryUpazila) && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-primary" />
                  <span className="truncate">
                    {[primaryUpazila, primaryDistrict]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </span>
              )}
              {experienceYears > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="size-3 text-muted-foreground" />
                  <span>{toBengaliDigits(experienceYears)} বছর অভিজ্ঞতা</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Services Tags: Single Sleek Row ───────────────── */}
        {services.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {services.slice(0, 3).map((s) => (
              <Badge
                key={s.id}
                variant="outline"
                className="text-xs font-normal"
              >
                {s.service.name}
              </Badge>
            ))}
            {services.length > 3 && (
              <Badge variant="outline">
                +{toBengaliDigits(services.length - 3)} আরও
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Footer: Price + Dual CTAs ────────────────── */}
      <div className="mt-5 pt-3.5 border-t border-border/50 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground leading-none">
            শুরু
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {minPrice != null
              ? `৳${minPrice.toLocaleString("bn-BD")}`
              : "আলোচনা সাপেক্ষ"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {whatsappNumber && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:border-emerald-500/40 hover:bg-emerald-500/10 dark:text-emerald-400 h-8 px-2.5"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                window.open(
                  `https://wa.me/880${whatsappNumber.replace(/^0/, "")}?text=${encodeURIComponent(`হ্যালো, আমি ${fullName} এর প্রোফাইল Mouza Map Pro থেকে দেখছি। আপনার সেবা সম্পর্কে জানতে চাই।`)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </Button>
          )}

          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/surveyors/${surveyor.slug}`} />
            }
            className="gap-1 text-xs h-8 px-3"
          >
            বিস্তারিত
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
