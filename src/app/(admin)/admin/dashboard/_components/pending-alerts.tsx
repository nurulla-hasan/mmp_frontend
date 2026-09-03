import Link from "next/link";
import { ArrowRight, ShieldAlert, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingAlertsProps {
  pendingVerifications: number;
  pendingReviews: number;
}

export function PendingAlerts({
  pendingVerifications,
  pendingReviews,
}: PendingAlertsProps) {
  if (pendingVerifications === 0 && pendingReviews === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {pendingVerifications > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">
                {pendingVerifications} Surveyor Application{pendingVerifications > 1 ? "s" : ""} Pending
              </span>
              <span className="text-xs text-muted-foreground opacity-90">
                Awaiting document & identity verification.
              </span>
            </div>
          </div>

          <Button
            render={<Link href="/admin/verifications" />}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            Review
            <ArrowRight />
          </Button>
        </div>
      )}

      {pendingReviews > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
              <Star className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">
                {pendingReviews} Client Review{pendingReviews > 1 ? "s" : ""} Awaiting Approval
              </span>
              <span className="text-xs text-muted-foreground opacity-90">
                Moderate before publishing on surveyor profiles.
              </span>
            </div>
          </div>

          <Button
            render={<Link href="/admin/reviews" />}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            Moderate
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  );
}
