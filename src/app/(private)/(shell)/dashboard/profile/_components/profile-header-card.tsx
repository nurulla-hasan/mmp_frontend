import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { TAuthUser } from "@/interface/auth";
import { cn, formatDate, getInitials } from "@/lib/utils";

export function ProfileHeaderCard({ user }: { user: TAuthUser }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div
              className={cn(
                "rounded-full",
                user.is_subscribed
                  ? "bg-conic from-violet-500 via-green-500 to-red-500 p-0.5"
                  : "ring-1 ring-border p-1",
              )}
            >
              <div className="rounded-full bg-card p-1">
                <Avatar size="xl">
                  <AvatarImage src={user.image_url} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </div>
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
            {user.is_subscribed ? (
              <Badge variant="secondary">
                <Sparkles className="size-3 text-primary" />
                <span>সাবস্ক্রাইবড</span>
              </Badge>
            ) : (
              <Badge variant="secondary">ফ্রি মেম্বার</Badge>
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

          {user.created_at && (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0 text-primary" />
              <span>যোগদান: {formatDate(user.created_at)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            nativeButton={false}
            render={<Link href="/dashboard/profile/edit" />}
          >
            <Pencil className="size-3.5" />
            <span>প্রোফাইল এডিট</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
