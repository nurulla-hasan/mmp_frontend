import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

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

  isSubscribed?: boolean;
  startingPrice?: number;
};

const MAX_VISIBLE_SERVICES = 3;

export function SurveyorCard({ surveyor }: { surveyor: TSurveyorCard }) {
  const visibleServices = surveyor.services.slice(0, MAX_VISIBLE_SERVICES);
  const extraCount = surveyor.services.length - MAX_VISIBLE_SERVICES;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 p-5 md:p-6">
        {/* ── Profile header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Avatar */}
            {surveyor.isSubscribed ? (
              <div className="shrink-0 rounded-full p-0.5 bg-linear-to-br from-violet-500 via-green-500 to-red-500">
                {surveyor.profilePhoto ? (
                  <Avatar size="lg">
                    <AvatarImage
                      src={surveyor.profilePhoto}
                      alt={surveyor.fullName}
                    />
                    <AvatarFallback>
                      {getInitials(surveyor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar size="lg">
                    <AvatarFallback>
                      {getInitials(surveyor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ) : surveyor.profilePhoto ? (
              <Avatar size="lg">
                <AvatarImage
                  src={surveyor.profilePhoto}
                  alt={surveyor.fullName}
                />
                <AvatarFallback>
                  {getInitials(surveyor.fullName)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar size="lg">
                <AvatarFallback>
                  {getInitials(surveyor.fullName)}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Name + location */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-lg font-semibold font-heading leading-tight md:text-xl">
                  {surveyor.fullName}
                </h3>
                {surveyor.isVerified && (
                  <span title="Mouza Map Pro verified profile">
                    <BadgeCheck className="size-5 shrink-0 text-primary" />
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate">
                  {surveyor.primaryLocation.upazila},{" "}
                  {surveyor.primaryLocation.district}
                </span>
              </div>
            </div>
          </div>

          {/* Rating block */}
          <div className="shrink-0 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-center">
            <div className="flex items-center gap-1 text-sm font-semibold">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span>{surveyor.rating.toFixed(1)}</span>
            </div>
            <p className="whitespace-nowrap text-[11px] text-muted-foreground">
              {surveyor.totalReviews} রিভিউ
            </p>
          </div>
        </div>

        {/* ── Professional headline ── */}
        <p className="line-clamp-2 text-sm font-medium text-foreground md:text-base">
          {surveyor.headline}
        </p>

        {/* ── Statistics ── */}
        <div className="grid grid-cols-3 rounded-xl border border-border/70 bg-muted/40 px-3 py-3">
          <div className="text-center">
            <p className="text-sm font-semibold md:text-base">
              {surveyor.experienceYears} বছর
            </p>
            <p className="text-xs text-muted-foreground">অভিজ্ঞতা</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold md:text-base">
              {surveyor.totalReviews}
            </p>
            <p className="text-xs text-muted-foreground">রিভিউ</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold md:text-base">
              {surveyor.completedRequests}টি
            </p>
            <p className="text-xs text-muted-foreground">কাজ সম্পন্ন</p>
          </div>
        </div>

        {/* ── Service badges ── */}
        <div className="flex flex-wrap gap-1.5">
          {visibleServices.map((service) => (
            <Badge key={service.id} variant="secondary">
              {service.name}
            </Badge>
          ))}
          {extraCount > 0 && (
            <Badge variant="outline">
              +{extraCount} আরও
            </Badge>
          )}
        </div>

        {/* ── Separator ── */}
        <div className="border-t border-border/40" />

        {/* ── Price ── */}
        <div>
          <p className="text-xs text-muted-foreground">প্রাথমিক মূল্য</p>
          {surveyor.startingPrice != null ? (
            <p className="text-sm font-semibold text-primary md:text-base">
              ৳{surveyor.startingPrice.toLocaleString("bn")} থেকে
            </p>
          ) : (
            <p className="text-sm font-semibold text-primary md:text-base">
              Quotation অনুযায়ী মূল্য
            </p>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/surveyors/${surveyor.slug}`} />}
          >
            প্রোফাইল দেখুন
          </Button>
          <Button
            className="sm:ml-auto"
            nativeButton={false}
            render={
              <Link href={`/post-request?surveyor=${surveyor.slug}`} />
            }
          >
            Quotation চান
          </Button>
        </div>
      </div>
    </div>
  );
}
