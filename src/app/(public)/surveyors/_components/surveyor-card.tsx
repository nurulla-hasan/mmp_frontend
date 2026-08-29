"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Briefcase, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/common/star-rating";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import type {
  TSurveyorProfile,
  TSurveyorServiceWithPrice,
} from "@/interface/surveyor-profile";
import { Separator } from "@/components/ui/separator";

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

  return (
    <Link
      href={`/surveyors/${surveyor.slug}`}
      className="flex flex-col rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full"
    >
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex-1 space-y-4">
          {/* Header: Large avatar + Name/Location */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 overflow-hidden">
              <div className="size-16 md:size-20 overflow-hidden">
                <Avatar
                  className={cn(
                    "size-full",
                    isSubscribed &&
                      "bg-conic from-violet-500 via-green-500 to-red-500 p-0.5",
                  )}
                >
                  <AvatarImage
                    src={profilePhoto}
                    alt={fullName}
                    className="size-full object-cover"
                  />
                  <AvatarFallback className="size-full text-lg md:text-xl">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="truncate font-semibold font-heading text-base md:text-lg">
                    {fullName}
                  </h3>
                  {isVerified && (
                    <BadgeCheck className="size-4 shrink-0 text-primary" />
                  )}
                </div>
                {rating > 0 ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <StarRating
                      rating={Math.round(rating)}
                      totalStars={1}
                      size={14}
                    />
                    <span className="font-medium text-sm">
                      {rating.toFixed(1)}
                    </span>
                    {totalReviews > 0 && (
                      <span className="text-muted-foreground text-xs">
                        ({totalReviews})
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge variant="info">নতুন</Badge>
                )}
              </div>
              {surveyor.headline && (
                <p className="mt-1 text-sm text-muted-foreground/80 line-clamp-1">
                  {surveyor.headline}
                </p>
              )}
              {(primaryDistrict || primaryUpazila) && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">
                    {[primaryUpazila, primaryDistrict]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Briefcase className="size-3.5 shrink-0" />
                <span>অভিজ্ঞতা: {experienceYears} বছর</span>
              </div>
            </div>
          </div>

          {/* Service badges */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {services.slice(0, 3).map((service, idx) => (
                <Badge
                  key={`${service.service.slug}-${idx}`}
                  variant="secondary"
                >
                  {service.service.name}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline">
                  +{services.length - 3} আরও
                </Badge>
              )}
            </div>
          )}

          <Separator />

          {/* Per-service pricing */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground">
              সেবা ও মূল্য:
            </p>
            {services.length > 0 ? (
              services.slice(0, 3).map((service, idx) => (
                <div
                  key={`${service.service.slug}-price-${idx}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground truncate">
                    {service.service.name}
                  </span>
                  <span className="font-medium text-primary shrink-0 ml-2">
                    {service.startingPrice != null && service.startingPrice > 0
                      ? `৳${service.startingPrice.toLocaleString("bn-BD")} থেকে`
                      : "আলোচনা সাপেক্ষ"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                কোনো সেবা তালিকাভুক্ত নেই
              </p>
            )}
          </div>
        </div>

        {/* WhatsApp only */}
        {whatsappNumber ? (
          <Button
            className="w-full"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
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
        ) : null}
      </div>
    </Link>
  );
}
