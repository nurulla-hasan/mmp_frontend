import { ChevronRight } from "lucide-react";

import type { TSurveyorProfile } from "@/types/surveyor-profile.type";

export function SurveyorServices({
  services,
}: {
  services: TSurveyorProfile["services"];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold font-heading md:text-xl">
        সেবাসমূহ
      </h2>
      <div className="mt-4 space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-foreground">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-1 leading-relaxed text-muted-foreground md:text-base">
                    {service.description}
                  </p>
                )}
              </div>
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
