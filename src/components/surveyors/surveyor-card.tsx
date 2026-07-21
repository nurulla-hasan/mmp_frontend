"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { StarRating } from "@/components/ui/custom/star-rating";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { TSurveyorServiceWithPrice } from "@/types/surveyor-profile.type";
import { Separator } from "@/components/ui/separator";

export type TSurveyorCard = {
  id: string;
  slug: string;
  fullName: string;
  profilePhoto?: string;
  isVerified: boolean;
  experienceYears: number;
  rating: number;
  totalReviews: number;
  primaryLocation: {
    district: string;
    upazila: string;
  };
  isSubscribed?: boolean;
  whatsappNumber?: string;
  services: TSurveyorServiceWithPrice[];
};

export function SurveyorCard({ surveyor }: { surveyor: TSurveyorCard }) {
  return (
    <Link
      href={`/surveyors/${surveyor.slug}`}
      className="flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex flex-col gap-4 p-5 md:p-6">
        {/* ── Header: Large square avatar + Name/Location ── */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "shrink-0 rounded-xl overflow-hidden",
              surveyor.isSubscribed
                ? "p-0.5 bg-linear-to-br from-violet-500 via-green-500 to-red-500"
                : "",
            )}
          >
            <div className="size-16 md:size-20 overflow-hidden rounded-xl">
              {surveyor.profilePhoto ? (
                <Avatar className="size-full rounded-xl">
                  <AvatarImage
                    src={surveyor.profilePhoto}
                    alt={surveyor.fullName}
                    className="size-full object-cover"
                  />
                  <AvatarFallback className="size-full rounded-xl text-lg md:text-xl">
                    {getInitials(surveyor.fullName)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="size-full rounded-xl">
                  <AvatarFallback className="size-full rounded-xl text-lg md:text-xl">
                    {getInitials(surveyor.fullName)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-semibold font-heading text-base md:text-lg">
                  {surveyor.fullName}
                </h3>
                {surveyor.isVerified && (
                  <BadgeCheck className="size-4 shrink-0 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <StarRating
                  rating={Math.round(surveyor.rating)}
                  totalStars={1}
                  size={14}
                />
                <span className="font-medium text-sm">
                  {surveyor.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({surveyor.totalReviews})
                </span>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">
                {surveyor.primaryLocation.upazila},{" "}
                {surveyor.primaryLocation.district}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              অভিজ্ঞতা: {surveyor.experienceYears} বছর
            </p>
          </div>
        </div>

        {/* ── Service badges ── */}
        {surveyor.services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {surveyor.services.slice(0, 3).map((service) => (
              <span
                key={service.id}
                className="rounded-md bg-primary/5 px-2 py-0.5 text-xs text-primary"
              >
                {service.name}
              </span>
            ))}
            {surveyor.services.length > 3 && (
              <span className="rounded-md bg-primary/5 px-2 py-0.5 text-xs text-muted-foreground">
                +{surveyor.services.length - 3} আরও
              </span>
            )}
          </div>
        )}
        <Separator />
        {/* ── Per-service pricing ── */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold">সেবা ও মূল্য :</p>
          {surveyor.services.slice(0, 3).map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground truncate">
                {service.name}
              </span>
              <span className="font-medium text-primary shrink-0 ml-2">
                {service.startingPrice != null
                  ? `৳${service.startingPrice.toLocaleString("bn")} থেকে`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
        {/* ── WhatsApp only ── */}
        {surveyor.whatsappNumber ? (
          <Button
            className="w-full"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              e.preventDefault();
              const num = surveyor.whatsappNumber!;
              window.open(
                `https://wa.me/880${num.replace(/^0/, "")}?text=${encodeURIComponent(`হ্যালো, আমি ${surveyor.fullName} এর প্রোফাইল Mouza Map Pro থেকে দেখছি। আপনার সেবা সম্পর্কে জানতে চাই।`)}`,
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
