import { Badge } from "@/components/ui/badge";
import { Banknote } from "lucide-react";

import type { TSurveyorProfile } from "@/interface/surveyor-profile";

const SERVICE_ICONS: Record<string, string> = {
  "land-measurement": "📏",
  "land-division": "📐",
  "boundary-determination": "📍",
  "digital-survey": "🖥️",
  "mouza-map": "🗺️",
  "survey-report": "📋",
  "khatian-search": "📑",
  "mutation": "📝",
  "record-verification": "✅",
  "plot-layout": "📐",
};

function getServiceIcon(slug: string): string {
  return SERVICE_ICONS[slug] ?? "🗺️";
}

export function SurveyorServices({
  services,
}: {
  services?: TSurveyorProfile["surveyorServices"];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold font-heading md:text-xl">
        সেবাসমূহ ও মূল্য
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {(services ?? []).map((service) => (
          <div
            key={service.id}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-linear-to-br from-card to-card/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/40 via-primary/60 to-primary/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                {getServiceIcon(service.service.slug)}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground transition-colors group-hover:text-primary">
                  {service.service.name}
                </h3>
                {service.startingPrice != null && (
                  <div className="mt-1">
                    <Badge variant="success">
                      <Banknote className="size-3" />
                      ৳{service.startingPrice.toLocaleString("bn-BD")} থেকে
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
