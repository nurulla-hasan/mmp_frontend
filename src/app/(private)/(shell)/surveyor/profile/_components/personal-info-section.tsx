"use client";

import { Calendar, Mail, MapPin, MessageCircle, Phone, User, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfoUpdate } from "./personal-info-update";
import type { TAuthUser } from "@/interface/auth";

const EMPTY = "তথ্য দেওয়া হয়নি";

type DistrictOption = { value: string; label: string; upazilas: string[] };

type PersonalInfoSectionProps = {
  user: TAuthUser | null;
  districts: DistrictOption[];
};

export function PersonalInfoSection({ user, districts }: PersonalInfoSectionProps) {
  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const districtLabel =
    districts.find((d) => d.value === user?.district)?.label || user?.district;

  const locationText = [user?.upazila, districtLabel].filter(Boolean).join(", ");

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2 font-semibold">
            <User className="size-4 text-primary" />
            ব্যক্তিগত ও অবস্থান
          </span>
          <PersonalInfoUpdate user={user} districts={districts} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full Name */}
        <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">পূর্ণ নাম</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {user?.name || EMPTY}
          </p>
        </div>

        {/* Mobile Number */}
        <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Phone className="size-3 text-primary" />
              মোবাইল নম্বর
            </p>
            {user?.phone && (
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                কলযোগ্য
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {user?.phone || EMPTY}
          </p>
        </div>

        {/* WhatsApp Number */}
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="size-3.5" />
              WhatsApp নম্বর
            </p>
            {user?.whatsappNumber && (
              <Badge variant="secondary" className="bg-emerald-500/15 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                সক্রিয়
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {user?.whatsappNumber || EMPTY}
          </p>
        </div>

        {/* Email Address */}
        <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Mail className="size-3 text-primary" />
              ইমেইল
            </p>
            {user?.emailVerified && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                যাচাইকৃত
              </span>
            )}
          </div>
          <p className="mt-1 break-all text-sm font-medium text-foreground">
            {user?.email || EMPTY}
          </p>
        </div>

        {/* Primary Location */}
        <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3 text-primary" />
            প্রধান অবস্থান (জেলা ও উপজেলা)
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {locationText || EMPTY}
          </p>
        </div>

        {/* Joined Date */}
        {formattedDate && (
          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>যোগদানের তারিখ: {formattedDate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
