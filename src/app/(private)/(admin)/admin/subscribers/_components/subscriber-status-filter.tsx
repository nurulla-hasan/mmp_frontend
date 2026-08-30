"use client";

import { useNextFilter } from "@/hooks/useNextFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TSubscriptionStatus } from "@/interface/subscriber";

const statusOptions: { label: string; value: TSubscriptionStatus }[] = [
  { label: "All Subscribers", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Pending", value: "PENDING" },
];

export function SubscriberStatusFilter() {
  const { getFilter, updateFilter } = useNextFilter();
  const currentStatus =
    (getFilter("status", "ALL") as TSubscriptionStatus) || "ALL";

  return (
    <Select
      value={currentStatus}
      onValueChange={(val) => {
        if (val) {
          updateFilter("status", val === "ALL" ? null : val);
        }
      }}
    >
      <SelectTrigger className="w-full sm:w-30 ">
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

