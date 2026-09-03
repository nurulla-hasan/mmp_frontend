"use client";

import { Check } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toBengaliDigits } from "@/lib/utils";
import type { TPlan } from "@/interface/plan";

interface PlanComparisonProps {
  plans?: TPlan[];
}

const recomendedBg = "bg-primary/5";

export function PlanComparison({ plans = [] }: PlanComparisonProps) {
  if (!plans || plans.length === 0) {
    return null;
  }

  const displayPlans = plans.map((p) => ({
    name: p.name,
    price: `৳${toBengaliDigits(p.price)}`,
    duration:
      p.durationDays === 30
        ? "১ মাস"
        : p.durationDays === 180
        ? "৬ মাস"
        : p.durationDays === 365
        ? "১ বছর"
        : `${toBengaliDigits(p.durationDays)} দিন`,
    recommended: p.isPopular,
  }));

  const comparisonRows: { label: string; values: string[] }[] = [
    {
      label: "প্ল্যান মেয়াদ",
      values: displayPlans.map((p) => p.duration),
    },
    {
      label: "মূল্য",
      values: displayPlans.map((p) => p.price),
    },
    {
      label: "জমির একক রূপান্তর",
      values: displayPlans.map(() => "ফ্রি"),
    },
    {
      label: "জমি বণ্টন ক্যালকুলেটর",
      values: displayPlans.map(() => "ফ্রি"),
    },
    {
      label: "জমির ক্ষেত্রফল (প্লট মাপ)",
      values: displayPlans.map(() => "✓"),
    },
    {
      label: "প্যান্টাগ্রাফ (ম্যাপ এলাইনমেন্ট)",
      values: displayPlans.map(() => "✓"),
    },
    {
      label: "ডিজিটাল ম্যাপ ট্রেসিং",
      values: displayPlans.map(() => "✓"),
    },
    {
      label: "মৌজা ম্যাপ স্টুডিও",
      values: displayPlans.map(() => "✓"),
    },
    {
      label: "মৌজা জিও স্টুডিও (KMZ)",
      values: displayPlans.map((p) => (p.recommended ? "✓" : "—")),
    },
    {
      label: "প্রকল্প সেভ ও সম্পাদনা",
      values: displayPlans.map(() => "আনলিমিটেড"),
    },
    {
      label: "PDF/Print/PNG এক্সপোর্ট",
      values: displayPlans.map(() => "আনলিমিটেড"),
    },
    {
      label: "নতুন ফিচারে অগ্রাধিকার",
      values: displayPlans.map((p) => (p.recommended ? "✓" : "—")),
    },
  ];

  return (
    <SectionWrapper id="plan-comparison">
      <SectionHeading
        badge="প্ল্যান তুলনা"
        title="Planগুলোর পার্থক্য এক নজরে"
        description="সব Pro plan একই মূল সুবিধা দেয়; প্রধান পার্থক্য হলো plan-এর মেয়াদ ও মূল্য।"
      />

      <div className="mt-10 rounded-xl border bg-card shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="px-6 py-4 text-left font-semibold text-foreground">
                সুবিধা
              </TableHead>
              {displayPlans.map((plan) => (
                <TableHead
                  key={plan.name}
                  className={
                    plan.recommended
                      ? `px-6 py-4 text-center font-semibold text-foreground ${recomendedBg}`
                      : "px-6 py-4 text-center font-semibold text-foreground"
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {plan.name}
                    {plan.recommended && (
                      <Badge className="bg-primary p-2 text-xs leading-none text-primary-foreground">
                        সেরা
                      </Badge>
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonRows.map((row, i) => (
              <TableRow
                key={row.label}
                className={
                  i % 2 === 0
                    ? "hover:bg-muted/20"
                    : "bg-muted/20 hover:bg-muted/30"
                }
              >
                <TableCell className="px-6 py-4 font-medium text-foreground">
                  {row.label}
                </TableCell>
                {row.values.map((val, j) => (
                  <TableCell
                    key={j}
                    className={
                      displayPlans[j]?.recommended
                        ? `px-6 py-4 text-center text-muted-foreground ${recomendedBg}`
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
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionWrapper>
  );
}
