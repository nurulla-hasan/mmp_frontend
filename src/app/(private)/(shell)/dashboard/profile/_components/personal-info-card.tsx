"use client";

import {
  CalendarDays,
  Edit,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "./profile-edit-modal";
import type { TAuthUser } from "@/interface/auth";
import { formatDate } from "@/lib/utils";

type DistrictOption = { value: string; label: string; upazilas: string[] };

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card/50 p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function PersonalInfoCard({
  user,
  districts,
}: {
  user: TAuthUser;
  districts: DistrictOption[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>ব্যক্তিগত ও যোগাযোগ তথ্য</CardTitle>
        <ProfileEditModal
          user={user}
          districts={districts}
          trigger={
            <Button variant="ghost" size="sm">
              <Edit className="size-3.5" />
              <span>এডিট</span>
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem icon={User} label="পূর্ণ নাম" value={user.name} />
          <InfoItem icon={Mail} label="ইমেইল অ্যাড্রেস" value={user.email} />
          <InfoItem
            icon={Phone}
            label="ফোন নম্বর"
            value={user.phone || "যুক্ত করা হয়নি"}
          />
          <InfoItem
            icon={MessageCircle}
            label="WhatsApp নম্বর"
            value={user.whatsappNumber || "যুক্ত করা হয়নি"}
          />
          <InfoItem
            icon={MapPin}
            label="বর্তমান ঠিকানা"
            value={
              user.upazila || user.district
                ? `${user.upazila ? `${user.upazila}, ` : ""}${user.district || ""}`
                : "যুক্ত করা হয়নি"
            }
          />
          <InfoItem
            icon={CalendarDays}
            label="অ্যাকাউন্ট তৈরি"
            value={user.createdAt ? formatDate(user.createdAt) : "N/A"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
