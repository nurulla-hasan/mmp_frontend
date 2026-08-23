import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TAuthUser } from "@/interface/auth";
import { formatDate } from "@/lib/utils";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function PersonalInfoCard({ user }: { user: TAuthUser }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <InfoRow icon={Mail} label="ইমেইল" value={user.email} />
        <Separator />
        <InfoRow icon={Phone} label="ফোন" value={user.phone ?? "যুক্ত নয়"} />
        <Separator />
        <InfoRow
          icon={Phone}
          label="WhatsApp"
          value={user.whatsappNumber ?? "যুক্ত নয়"}
        />
        <Separator />
        <InfoRow
          icon={MapPin}
          label="অবস্থান"
          value={
            user.location
              ? `${user.location.upazila}, ${user.location.district}`
              : "যুক্ত নয়"
          }
        />
        <Separator />
        <InfoRow
          icon={CalendarDays}
          label="যোগদান"
          value={user.joinedAt ? formatDate(user.joinedAt) : "N/A"}
        />
      </CardContent>
    </Card>
  );
}
