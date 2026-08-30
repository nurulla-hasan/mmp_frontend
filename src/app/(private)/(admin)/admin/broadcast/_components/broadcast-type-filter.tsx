"use client";

import { useNextFilter } from "@/hooks/useNextFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TBroadcastType } from "@/interface/broadcast";

const typeOptions: { label: string; value: TBroadcastType | "ALL" }[] = [
  { label: "All Types", value: "ALL" },
  { label: "Info", value: "INFO" },
  { label: "Promo", value: "PROMO" },
  { label: "Warning", value: "WARNING" },
  { label: "Maintenance", value: "MAINTENANCE" },
];

export function BroadcastTypeFilter() {
  const { getFilter, updateFilter } = useNextFilter();
  const currentType = (getFilter("type", "ALL") as TBroadcastType | "ALL") || "ALL";

  return (
    <Select
      value={currentType}
      onValueChange={(val) => {
        if (val) {
          updateFilter("type", val === "ALL" ? null : val);
        }
      }}
    >
      <SelectTrigger className="w-full sm:w-36">
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {typeOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

