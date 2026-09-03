"use client";

import { X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNextFilter } from "@/hooks/useNextFilter";
import type { TSurveyorService } from "@/interface/surveyor-profile";

type DistrictOption = {
  value: string;
  label: string;
  upazilas: string[];
};

type ActiveFilterChipsProps = {
  districts: DistrictOption[];
  services: TSurveyorService[];
};

export function ActiveFilterChips({
  districts,
  services,
}: ActiveFilterChipsProps) {
  const { getFilter, updateFilter, clearAll, isFilterActive } = useNextFilter();

  const searchTerm = getFilter("searchTerm");
  const service = getFilter("service");
  const district = getFilter("district");
  const rating = getFilter("rating");
  const experienceMin = getFilter("experienceMin");
  const sortBy = getFilter("sortBy");

  const filterKeys = [
    "searchTerm",
    "service",
    "district",
    "rating",
    "experienceMin",
    "sortBy",
  ] as const;

  if (!isFilterActive(filterKeys)) return null;

  const serviceLabel =
    services.find((s) => s.slug === service)?.name || service;
  const districtLabel =
    districts.find((d) => d.value === district)?.label || district;

  const sortLabelMap: Record<string, string> = {
    rating_desc: "সর্বোচ্চ রেটিং",
    experience_desc: "অভিজ্ঞতা",
    newest: "নতুন সদস্য",
    oldest: "পুরাতন সদস্য",
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-xs font-medium text-muted-foreground">
        সক্রিয় ফিল্টার:
      </span>

      {searchTerm && (
        <Badge
          variant="secondary"
          className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs font-normal"
        >
          <span>অনুসন্ধান: &quot;{searchTerm}&quot;</span>
          <button
            type="button"
            onClick={() => updateFilter("searchTerm", null)}
            className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {service && (
        <Badge
          variant="secondary"
          className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs font-normal"
        >
          <span>সেবা: {serviceLabel}</span>
          <button
            type="button"
            onClick={() => updateFilter("service", null)}
            className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {district && (
        <Badge
          variant="secondary"
          className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs font-normal"
        >
          <span>জেলা: {districtLabel}</span>
          <button
            type="button"
            onClick={() => updateFilter("district", null)}
            className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {rating && (
        <Badge
          variant="secondary"
          className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs font-normal"
        >
          <span>রেটিং: {rating}+ স্টার</span>
          <button
            type="button"
            onClick={() => updateFilter("rating", null)}
            className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {experienceMin && (
        <Badge
          variant="secondary"
          className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs font-normal"
        >
          <span>অভিজ্ঞতা: {experienceMin}+ বছর</span>
          <button
            type="button"
            onClick={() => updateFilter("experienceMin", null)}
            className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      {sortBy && sortLabelMap[sortBy] && (
        <Badge
          variant="secondary"
          className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs font-normal"
        >
          <span>সাজানো: {sortLabelMap[sortBy]}</span>
          <button
            type="button"
            onClick={() => updateFilter("sortBy", null)}
            className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => clearAll()}
        className="gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors h-6 px-2"
      >
        <RotateCcw className="size-3" />
        সব মুছুন
      </Button>
    </div>
  );
}

