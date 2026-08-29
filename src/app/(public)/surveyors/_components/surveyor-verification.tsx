import { BadgeCheck } from "lucide-react";

import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function SurveyorVerification({
  verification,
}: {
  verification?: TSurveyorProfile["verification"];
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground">
        ভেরিফিকেশন
      </h2>
      <div className="mt-3 space-y-2.5">
        <div className="flex items-center gap-2 text-sm">
          <BadgeCheck className="size-4 text-primary" />
          <span className="text-foreground">পরিচয় যাচাইকৃত</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <BadgeCheck className="size-4 text-primary" />
          <span className="text-foreground">পেশাগত তথ্য যাচাইকৃত</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {verification?.note ?? ""}
        </p>
      </div>
    </section>
  );
}
