import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";

import { StarRating } from "@/components/ui/custom/star-rating";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

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
  services: {
    id: string;
    slug: string;
    name: string;
  }[];
  startingPrice?: number;
};

const MAX_VISIBLE_SERVICES = 3;

export function SurveyorCard({ surveyor }: { surveyor: TSurveyorCard }) {
  const visibleServices = surveyor.services.slice(0, MAX_VISIBLE_SERVICES);
  const extraCount = surveyor.services.length - MAX_VISIBLE_SERVICES;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 p-5 md:p-6">
        {/* ── Header: Avatar + Name/Location ── */}
        <div className="flex items-center gap-3">
          <div className={surveyor.isSubscribed ? "shrink-0 rounded-full p-0.5 bg-linear-to-br from-violet-500 via-green-500 to-red-500" : ""}>
            {surveyor.profilePhoto ? (
              <Avatar>
                <AvatarImage src={surveyor.profilePhoto} alt={surveyor.fullName} />
                <AvatarFallback>{getInitials(surveyor.fullName)}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback>{getInitials(surveyor.fullName)}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="truncate font-medium">{surveyor.fullName}</h3>
              {surveyor.isVerified && (
                <BadgeCheck className="size-4 shrink-0 text-primary" />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">
                {surveyor.primaryLocation.upazila},{" "}
                {surveyor.primaryLocation.district}
              </span>
            </div>
          </div>
        </div>

        {/* ── Experience & Rating ── */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            অভিজ্ঞতা: {surveyor.experienceYears} বছর
          </span>
          <div className="flex items-center gap-1">
            <StarRating rating={Math.round(surveyor.rating)} totalStars={1} size={14} />
            <span className="font-medium">{surveyor.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({surveyor.totalReviews})</span>
          </div>
        </div>

        {/* ── Service badges ── */}
        {visibleServices.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleServices.map((service) => (
              <span
                key={service.id}
                className="rounded-md bg-primary/5 px-2 py-0.5 text-xs text-primary"
              >
                {service.name}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="rounded-md bg-primary/5 px-2 py-0.5 text-xs text-muted-foreground">
                +{extraCount} আরও
              </span>
            )}
          </div>
        )}

        {/* ── Starting price ── */}
        <div className="border-t border-border/40 pt-3">
          <p className="text-xs text-muted-foreground">প্রাথমিক মূল্য</p>
          <p className="text-sm font-semibold text-primary">
            {surveyor.startingPrice != null
              ? `৳${surveyor.startingPrice.toLocaleString("bn")} থেকে`
              : "Quotation অনুযায়ী মূল্য"}
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            nativeButton={false}
            render={<Link href={`/surveyors/${surveyor.slug}`} />}
          >
            প্রোফাইল দেখুন
          </Button>
          <Button
            size="sm"
            className="flex-1"
            nativeButton={false}
            render={<Link href={`/post-request?surveyor=${surveyor.slug}`} />}
          >
            Quotation চান
          </Button>
        </div>
      </div>
    </div>
  );
}
