import { Check } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "./pricing-data";

const COMPARISON_ROWS: { label: string; values: string[] }[] = [
  {
    label: "Plan duration",
    values: PRICING_PLANS.map((p) => p.duration),
  },
  {
    label: "Calculation project",
    values: ["✓", "✓", "✓"],
  },
  {
    label: "Multiple plot support",
    values: ["✓", "✓", "✓"],
  },
  {
    label: "Project save",
    values: ["✓", "✓", "✓"],
  },
  {
    label: "Continue editing",
    values: ["✓", "✓", "✓"],
  },
  {
    label: "PDF/Print report",
    values: ["✓", "✓", "✓"],
  },
  {
    label: "Device-based access",
    values: ["Plan policy অনুযায়ী", "Plan policy অনুযায়ী", "Plan policy অনুযায়ী"],
  },
  {
    label: "Priority updates",
    values: ["✓", "✓", "✓"],
  },
];

export function PlanComparison() {
  return (
    <SectionWrapper id="plan-comparison">
      <SectionHeading
        badge="Plan Comparison"
        title="Planগুলোর পার্থক্য এক নজরে"
        description="সব Pro plan একই মূল সুবিধা দেয়; প্রধান পার্থক্য হলো plan-এর মেয়াদ ও মূল্য।"
      />

      <div className="mt-10 overflow-x-auto rounded-xl border bg-card shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
        <table className="w-full min-w-150 text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-6 py-4 text-left font-semibold text-foreground">
                সুবিধা
              </th>
              {PRICING_PLANS.map((plan) => (
                <th
                  key={plan.name}
                  className={
                    plan.recommended
                      ? "px-6 py-4 text-center font-semibold text-foreground bg-primary/5"
                      : "px-6 py-4 text-center font-semibold text-foreground"
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {plan.name}
                    {plan.recommended && (
                      <Badge className="bg-primary p-2 text-[10px] leading-none text-primary-foreground">
                        সেরা
                      </Badge>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={row.label}
                className={
                  i % 2 === 0
                    ? "border-b transition-colors hover:bg-muted/20"
                    : "border-b bg-muted/20 transition-colors hover:bg-muted/30"
                }
              >
                <td className="px-6 py-4 font-medium text-foreground">
                  {row.label}
                </td>
                {row.values.map((val, j) => (
                  <td
                    key={j}
                    className={
                      PRICING_PLANS[j].recommended
                        ? "px-6 py-4 text-center text-muted-foreground bg-primary/5"
                        : "px-6 py-4 text-center text-muted-foreground"
                    }
                  >
                    {val === "✓" ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                          <Check className="size-3 text-primary" aria-hidden="true" />
                        </span>
                        <span className="sr-only">Included</span>
                      </span>
                    ) : (
                      <span className="text-xs">{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
