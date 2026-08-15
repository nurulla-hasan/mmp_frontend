"use client";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { planColumns, type PlanRow } from "./_components/plan-column";

const Plans: PlanRow[] = [
  {
    id: "p-001",
    name: "Monthly Pro",
    code: "pro_monthly",
    price: 99,
    discount: "",
    duration: "1 month",
    features: 5,
    active: true,
  },
  {
    id: "p-002",
    name: "6 Months Pro",
    code: "pro_6months",
    price: 599,
    discount: "",
    duration: "6 months",
    features: 5,
    active: true,
  },
  {
    id: "p-003",
    name: "Yearly Pro",
    code: "pro_yearly",
    price: 999,
    discount: "",
    duration: "1 year",
    features: 5,
    active: true,
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Plans"
        description="Configure subscription plans and pricing tiers."
        as="h3"
        alignment="left"
      />
      <DataTable
        data={Plans}
        columns={planColumns}
        searchKey="name"
        searchPlaceholder="Search plans..."
      />
    </div>
  );
}
