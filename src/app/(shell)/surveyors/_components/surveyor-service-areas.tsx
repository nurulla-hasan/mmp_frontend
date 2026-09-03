import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function SurveyorServiceAreas({
  serviceAreas,
}: {
  serviceAreas?: TSurveyorProfile["serviceAreas"];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold font-heading md:text-xl">
        সেবা এলাকা
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(serviceAreas ?? []).map((area) => (
          <div
            key={area.district}
            className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/20"
          >
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              {area.district}
            </h3>
            {area.upazilas.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {area.upazilas.map((upazila) => (
                  <Badge
                    key={upazila}
                    variant="outline"
                  >
                    {upazila}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                জেলার সকল উপজেলায় সেবা প্রযোজ্য
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
