import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { TAuthUser } from "@/interface/auth";
import { Pencil } from "lucide-react";
import Link from "next/link";

export function ProfileHeader({ user }: { user: TAuthUser }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={user.profilePhoto} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold font-heading">{user.name}</h2>
            <Badge variant="outline">{user.role}</Badge>
            {user.isSubscribed ? (
              <Badge variant="success">সাবস্ক্রাইবড</Badge>
            ) : (
              <Badge variant="secondary">ফ্রি</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      {/* TODO: create /dashboard/profile/edit page */}
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href="/dashboard/profile/edit" />}
      >
        <Pencil />
        প্রোফাইল এডিট
      </Button>
    </div>
  );
}
