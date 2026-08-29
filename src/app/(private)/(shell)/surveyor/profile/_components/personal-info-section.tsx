"use client";

import { User, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfoUpdate } from "./personal-info-update";
import type { TAuthUser } from "@/interface/auth";

const EMPTY = "তথ্য দেওয়া হয়নি";

type PersonalInfoSectionProps = {
  user: TAuthUser | null;
};

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            ব্যক্তিগত তথ্য
          </span>
          <PersonalInfoUpdate user={user} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* ── Profile Photo ── */}
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              প্রোফাইল ছবি
            </p>
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <User className="size-8" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Full Name (view) ── */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">পূর্ণ নাম</p>
            <p className="mt-1 text-sm">
              {user?.name ? user.name : EMPTY}
            </p>
          </div>

          {/* ── Phone (view) ── */}
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Phone className="size-3.5" />
              মোবাইল নম্বর
            </p>
            <p className="mt-1 text-sm">
              {user?.phone ? user.phone : EMPTY}
            </p>
          </div>

          {/* ── Email (view) ── */}
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">ইমেইল</p>
            <p className="mt-1 text-sm">
              {user?.email ? user.email : EMPTY}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
