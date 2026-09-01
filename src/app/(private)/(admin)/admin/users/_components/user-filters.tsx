"use client";

import { useNextFilter } from "@/hooks/useNextFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function UserFilters() {
  const { getFilter, updateFilter, clearAll, isFilterActive } = useNextFilter();

  const role = getFilter("role", "ALL");
  const status = getFilter("status", "ALL");

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {/* Role Filter */}
      <Select
        value={role}
        onValueChange={(val) =>
          updateFilter("role", !val || val === "ALL" ? null : val)
        }
      >
        <SelectTrigger className="w-full flex-1 sm:w-32 text-xs">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="ALL">ALL ROLES</SelectItem>
          <SelectItem value="USER">USER</SelectItem>
          <SelectItem value="SURVEYOR">SURVEYOR</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={status}
        onValueChange={(val) =>
          updateFilter("status", !val || val === "ALL" ? null : val)
        }
      >
        <SelectTrigger className="w-full flex-1 sm:w-32 text-xs">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="ALL">ALL STATUS</SelectItem>
          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
          <SelectItem value="BLOCKED">BLOCKED</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Filter Button */}
      {isFilterActive(["role", "status", "searchTerm"]) && (
        <Button
          type="button"
          variant="outline"
          onClick={() => clearAll()}
          title="Reset all filters"
          className="shrink-0"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      )}
    </div>
  );
}
