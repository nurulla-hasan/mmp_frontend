import { MapPin } from "lucide-react";

import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function SurveyorServiceAreas({
  serviceAreas,
}: {
  serviceAreas: TSurveyorProfile["serviceAreas"];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold font-heading md:text-xl">
        সেবা এলাকা
      </h2>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {serviceAreas.map((area) => (
          <div
            key={area.district}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              {area.district}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {area.upazilas.join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
