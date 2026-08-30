import { MapPin } from "lucide-react";

interface DistrictDistributionProps {
  districts: {
    district: string;
    surveyors: number;
  }[];
  totalSurveyors: number;
}

export function DistrictDistribution({
  districts,
  totalSurveyors,
}: DistrictDistributionProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">
            Top Surveyor Districts
          </span>
          <span className="text-[11px] text-muted-foreground">
            Geographical coverage & verified talent concentration
          </span>
        </div>
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <MapPin className="size-3.5" />
        </div>
      </div>

      <div className="space-y-3 pt-3">
        {districts.length > 0 ? (
          districts.map((d) => {
            const percentage = totalSurveyors > 0 ? Math.round((d.surveyors / totalSurveyors) * 100) : 0;
            return (
              <div key={d.district} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{d.district}</span>
                  <span className="text-muted-foreground font-mono">
                    {d.surveyors} ({percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    style={{ width: `${Math.max(5, percentage)}%` }}
                    className="h-full bg-primary rounded-full transition-all"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No district distribution data available.
          </p>
        )}
      </div>
    </div>
  );
}

