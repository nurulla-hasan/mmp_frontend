import { Badge } from "@/components/ui/badge";
import { Banknote, CheckCircle2 } from "lucide-react";

import type { TSurveyorProfile } from "@/interface/surveyor-profile";

export function SurveyorServices({
  services,
}: {
  services?: TSurveyorProfile["surveyorServices"];
}) {
  const serviceList = services ?? [];

  return (
    <section>
      <h2 className="text-lg font-semibold font-heading md:text-xl text-foreground">
        সেবাসমূহ ও প্রারম্ভিক মূল্য
      </h2>

      {serviceList.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serviceList.map((service) => (
            <div
              key={service.id}
              className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:bg-muted/10 hover:shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm text-foreground">
                    {service.service.name}
                  </h3>
                  {service.service.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {service.service.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">শুরু</span>
                {service.startingPrice != null && service.startingPrice > 0 ? (
                  <Badge variant="success">
                    <Banknote className="size-3" />
                    ৳{service.startingPrice.toLocaleString("bn-BD")}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    আলোচনা সাপেক্ষ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
          কোনো সেবা তালিকাভুক্ত নেই
        </div>
      )}
    </section>
  );
}
