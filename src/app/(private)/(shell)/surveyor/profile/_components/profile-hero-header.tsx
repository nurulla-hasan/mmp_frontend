"use client";

import { CheckCircle2, Clock, MapPin, ShieldAlert, Star, Briefcase, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TAuthUser } from "@/interface/auth";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

type DistrictOption = { value: string; label: string; upazilas: string[] };

type ProfileHeroHeaderProps = {
  user: TAuthUser | null;
  profile: TSurveyorProfile | null;
  districts?: DistrictOption[];
};

export function ProfileHeroHeader({ user, profile, districts = [] }: ProfileHeroHeaderProps) {
  const name = user?.name || "সার্ভেয়ার";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isVerified = profile?.isVerified ?? profile?.verificationStatus === "APPROVED";
  const verificationStatus = profile?.verificationStatus ?? "PENDING";
  const experienceYears = profile?.experienceYears ?? 0;
  const rating = profile?.rating ?? 0;
  const servicesCount = profile?.surveyorServices?.length ?? 0;

  const districtLabel =
    districts.find((d) => d.value === user?.district)?.label || user?.district;
  const locationText = [user?.upazila, districtLabel].filter(Boolean).join(", ");

  return (
    <Card className="pt-0 overflow-hidden border-border/60 bg-linear-to-br from-card via-card to-muted/30 shadow-xs">
      <div className="h-20 bg-linear-to-r from-primary/20 via-primary/10 to-transparent sm:h-24" />
      <CardContent className="relative px-6 pb-6 pt-0">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar & Main Info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-10 flex items-center justify-center sm:-mt-12">
              <Avatar className="size-20 border-4 border-card shadow-md sm:size-24">
                <AvatarImage src={user?.imageUrl || ""} alt={name} />
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary sm:text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {name}
                </h1>
                {isVerified ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="size-3.5" />
                    ভেরিফাইড সার্ভেয়ার
                  </Badge>
                ) : verificationStatus === "REJECTED" ? (
                  <Badge variant="rejected" className="gap-1">
                    <ShieldAlert className="size-3.5" />
                    আবেদন বাতিল
                  </Badge>
                ) : (
                  <Badge variant="progress" className="gap-1">
                    <Clock className="size-3.5" />
                    ভেরিফিকেশন অপেক্ষমাণ
                  </Badge>
                )}
              </div>

              <p className="text-sm font-medium text-muted-foreground sm:text-base">
                {profile?.headline || "পেশাদার ভূমি জরিপকারী"}
              </p>

              {locationText && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  {locationText}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
            <div className="flex flex-col items-center justify-center rounded-lg border border-border/50 bg-background/60 px-3.5 py-2 text-center shadow-xs">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>রেটিং</span>
              </div>
              <span className="mt-0.5 text-sm font-bold text-foreground">
                {rating > 0 ? rating.toFixed(1) : "নতুন"}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-border/50 bg-background/60 px-3.5 py-2 text-center shadow-xs">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="size-3.5 text-primary" />
                <span>অভিজ্ঞতা</span>
              </div>
              <span className="mt-0.5 text-sm font-bold text-foreground">
                {experienceYears} বছর
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-border/50 bg-background/60 px-3.5 py-2 text-center shadow-xs">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Award className="size-3.5 text-emerald-500" />
                <span>সেবা</span>
              </div>
              <span className="mt-0.5 text-sm font-bold text-foreground">
                {servicesCount} টি
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

