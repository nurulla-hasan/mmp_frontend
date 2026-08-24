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
import { PRICING_PLANS } from "./pricing-data";

const COMPARISON_ROWS: { label: string; values: string[] }[] = [
  {
    label: "প্ল্যান মেয়াদ",
    values: PRICING_PLANS.map((p) => p.duration),
  },
  {
    label: "মূল্য",
    values: PRICING_PLANS.map((p) => p.price),
  },
  {
    label: "জমির একক রূপান্তর",
    values: ["ফ্রি", "ফ্রি", "ফ্রি"],
  },
  {
    label: "জমি বণ্টন ক্যালকুলেটর",
    values: ["ফ্রি", "ফ্রি", "ফ্রি"],
  },
  {
    label: "জমির ক্ষেত্রফল (প্লট মাপ)",
    values: ["✓", "✓", "✓"],
  },
  {
    label: "প্যান্টাগ্রাফ (ম্যাপ এলাইনমেন্ট)",
    values: ["✓", "✓", "✓"],
  },
  {
    label: "ডিজিটাল ম্যাপ ট্রেসিং",
    values: ["—", "✓", "✓"],
  },
  {
    label: "মৌজা ম্যাপ স্টুডিও",
    values: ["—", "✓", "✓"],
  },
  {
    label: "মৌজা জিও স্টুডিও (KMZ)",
    values: ["—", "—", "✓"],
  },
  {
    label: "প্রকল্প সেভ ও সম্পাদনা",
    values: ["সীমিত", "আনলিমিটেড", "আনলিমিটেড"],
  },
  {
    label: "PDF/Print/PNG এক্সপোর্ট",
    values: ["সীমিত", "আনলিমিটেড", "আনলিমিটেড"],
  },
  {
    label: "নতুন ফিচারে অগ্রাধিকার",
    values: ["—", "—", "✓"],
  },
];

const recomendedBg = "bg-primary/5";

export function PlanComparison() {
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
              {PRICING_PLANS.map((plan) => (
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
                      <Badge className="bg-primary p-2 text-[10px] leading-none text-primary-foreground">
                        সেরা
                      </Badge>
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMPARISON_ROWS.map((row, i) => (
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
                      PRICING_PLANS[j].recommended
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
