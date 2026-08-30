"use client";

import {
  CalendarDays,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ProfileEditModal } from "./profile-edit-modal";
import type { TAuthUser } from "@/interface/auth";
import { formatDate, getInitials } from "@/lib/utils";

type DistrictOption = { value: string; label: string; upazilas: string[] };

export function ProfileHeaderCard({
  user,
  districts,
}: {
  user: TAuthUser;
  districts: DistrictOption[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div>
              <Avatar size="xl" isPro={user.isSubscribed}>
                <AvatarImage src={user.imageUrl} alt={user.name} />
                <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="font-heading text-xl font-bold text-foreground">
              {user.name}
            </h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <Badge variant="outline">
              <ShieldCheck className="size-3 text-muted-foreground" />
              <span>{user.role}</span>
            </Badge>
            {user.isSubscribed ? (
              <Badge variant="progress">
                <Sparkles className="size-3" />
                <span>সাবস্ক্রাইবড</span>
              </Badge>
            ) : (
              <Badge variant="outline">ফ্রি মেম্বার</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {user.upazila || user.district ? (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">
                {user.upazila}
                {user.upazila && user.district ? ", " : ""}
                {user.district}
              </span>
            </div>
          ) : null}

          {user.createdAt && (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0 text-primary" />
              <span>যোগদান: {formatDate(user.createdAt)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <ProfileEditModal user={user} districts={districts} />
        </div>
      </CardFooter>
    </Card>
  );
}
