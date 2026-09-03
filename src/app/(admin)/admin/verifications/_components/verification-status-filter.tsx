"use client";

import { useNextFilter } from "@/hooks/useNextFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TVerificationStatus } from "@/interface/verification";

const statusOptions: { label: string; value: TVerificationStatus }[] = [
  { label: "All Requests", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function VerificationStatusFilter() {
  const { getFilter, updateFilter } = useNextFilter();
  const currentStatus =
    (getFilter("status", "ALL") as TVerificationStatus) || "ALL";

  return (
    <Select
      value={currentStatus}
      onValueChange={(val) => {
        if (val) {
          updateFilter("status", val === "ALL" ? null : val);
        }
      }}
    >
      <SelectTrigger className="w-full sm:w-30 text-xs">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
