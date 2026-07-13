import { BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, getInitials } from "@/lib/utils";

export type TSurveyorCard = {
  id: string;
  slug: string;

  fullName: string;
  profilePhoto?: string;
  headline: string;

  isVerified: boolean;

  experienceYears: number;

  rating: number;
  totalReviews: number;
  completedRequests: number;

  primaryLocation: {
    district: string;
    upazila: string;
  };

  services: {
    id: string;
    slug: string;
    name: string;
  }[];

  startingPrice?: number;

  availabilityStatus: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
};

const availabilityConfig: Record<
  TSurveyorCard["availabilityStatus"],
  { label: string; dot: string }
> = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-500",
  },
  BUSY: {
    label: "Busy",
    dot: "bg-amber-500",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    dot: "bg-rose-500",
  },
};


export function SurveyorCard({ surveyor }: { surveyor: TSurveyorCard }) {
  const availability = availabilityConfig[surveyor.availabilityStatus];
  const MAX_VISIBLE_SERVICES = 2;
  const visibleServices = surveyor.services.slice(0, MAX_VISIBLE_SERVICES);
  const extraCount = surveyor.services.length - MAX_VISIBLE_SERVICES;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="flex flex-col gap-4 p-5">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {surveyor.profilePhoto ? (
            <img
              src={surveyor.profilePhoto}
              alt={surveyor.fullName}
              className="size-14 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary ring-1 ring-primary/20">
              {getInitials(surveyor.fullName)}
            </div>
          )}

          {/* Name + Headline */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-lg font-semibold font-heading">
                {surveyor.fullName}
              </h3>
              {surveyor.isVerified && (
                <BadgeCheck className="size-5 shrink-0 text-primary" />
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {surveyor.headline}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span>
            {surveyor.primaryLocation.upazila}, {surveyor.primaryLocation.district}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-y py-3">
          <div className="text-center">
            <p className="text-sm font-semibold">
              {surveyor.experienceYears} বছর
            </p>
            <p className="text-xs text-muted-foreground">অভিজ্ঞতা</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">
              ★ {surveyor.rating.toFixed(1)} ({surveyor.totalReviews})
            </p>
            <p className="text-xs text-muted-foreground">রেটিং</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">
              {surveyor.completedRequests}টি
            </p>
            <p className="text-xs text-muted-foreground">কাজ সম্পন্ন</p>
          </div>
        </div>

        {/* Service badges */}
        <div className="flex flex-wrap items-center gap-2">
          {visibleServices.map((service) => (
            <Badge key={service.id} variant="secondary" className="text-xs">
              {service.name}
            </Badge>
          ))}
          {extraCount > 0 && (
            <Badge variant="outline" className="text-xs">
              +{extraCount}
            </Badge>
          )}
        </div>

        {/* Availability + Starting price */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium",
              surveyor.availabilityStatus === "AVAILABLE" && "text-emerald-600 dark:text-emerald-400",
              surveyor.availabilityStatus === "BUSY" && "text-amber-600 dark:text-amber-400",
              surveyor.availabilityStatus === "UNAVAILABLE" && "text-rose-600 dark:text-rose-400",
            )}
          >
            <span className={cn("size-2 rounded-full", availability.dot)} />
            {availability.label}
          </span>
          {surveyor.startingPrice != null && (
            <span className="text-sm font-medium">
              শুরু ৳{surveyor.startingPrice.toLocaleString("bn")}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            nativeButton={false}
            render={<Link href={`/surveyors/${surveyor.slug}`} />}
          >
            প্রোফাইল দেখুন
          </Button>
          <Button
            className="flex-1 cursor-pointer"
            nativeButton={false}
            render={<Link href={`/surveyors/${surveyor.slug}`} />}
          >
            Quotation চান
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
