"use client";

import { useState } from "react";
import {
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Award,
  ArrowUpDown,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/common/star-rating";
import { SearchInput } from "@/components/common/search-input";
import { useNextFilter } from "@/hooks/useNextFilter";
import { cn } from "@/lib/utils";
import type { TSurveyorService } from "@/interface/surveyor-profile";

type DistrictOption = {
  value: string;
  label: string;
  upazilas: string[];
};

type SurveyorFilterProps = {
  districts: DistrictOption[];
  services: TSurveyorService[];
  totalResults?: number;
};

const SORT_OPTIONS = [
  { label: "ডিফল্ট (সুপারিশকৃত)", value: null },
  { label: "সর্বোচ্চ রেটিং", value: "rating_desc" },
  { label: "দীর্ঘ কাজের অভিজ্ঞতা", value: "experience_desc" },
  { label: "নতুন সদস্য", value: "newest" },
];

const EXPERIENCE_OPTIONS = [
  { label: "সকল", value: null },
  { label: "২+ বছর", value: "2" },
  { label: "৫+ বছর", value: "5" },
  { label: "১০+ বছর", value: "10" },
  { label: "১৫+ বছর", value: "15" },
];

export function SurveyorFilter({
  districts,
  services,
  totalResults,
}: SurveyorFilterProps) {
  const [open, setOpen] = useState(false);

  const {
    getFilter,
    updateFilter,
    clearAll,
    isFilterActive,
    getActiveCount,
  } = useNextFilter();

  const activeService = getFilter("service");
  const activeDistrict = getFilter("district");
  const activeRating = getFilter("rating");
  const activeSort = getFilter("sortBy");
  const activeExperience = getFilter("experienceMin");

  const filterKeys = [
    "searchTerm",
    "district",
    "service",
    "rating",
    "sortBy",
    "experienceMin",
  ] as const;

  const hasFilters = isFilterActive(filterKeys);
  const activeCount = getActiveCount(filterKeys);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-2 shrink-0">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>ফিল্টার</span>
            {activeCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0.5 text-xs font-semibold">
                {activeCount}
              </Badge>
            )}
          </Button>
        }
      />

      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* ── Header ─────────────────────────────────────────── */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 px-6 py-4 space-y-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <DialogTitle className="text-base font-semibold">
              ফিল্টার ও বাছাই
            </DialogTitle>
            {activeCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                {activeCount} টি ফিল্টার সক্রিয়
              </Badge>
            )}
          </div>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => clearAll()}
              className="gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors mr-8"
            >
              <RotateCcw className="size-3" />
              সব মুছুন
            </Button>
          )}
        </DialogHeader>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          {/* 1. Search Keyword */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              নাম বা বিশেষ শব্দ দিয়ে খুঁজুন
            </label>
            <SearchInput
              filterKey="searchTerm"
              placeholder="সার্ভেয়ারের নাম, বিবরণ বা কাজের ধরণ..."
              className="xl:max-w-full"
            />
          </div>

          <Separator />

          {/* 2. Services Filter */}
          <div className="grid gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
              <Briefcase className="size-3.5 text-primary" />
              সেবাসমূহ
            </label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => updateFilter("service", null)}
                className={cn(
                  "transition-all duration-200 text-xs px-3 py-1",
                  !activeService
                    ? "border-primary bg-primary text-primary-foreground font-medium shadow-xs"
                    : "border border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                সকল সেবা
              </Button>
              {services.map((srv) => (
                <Button
                  key={srv.id}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    updateFilter("service", activeService === srv.slug ? null : srv.slug)
                  }
                  className={cn(
                    "transition-all duration-200 text-xs px-3 py-1",
                    activeService === srv.slug
                      ? "border-primary bg-primary text-primary-foreground font-medium shadow-xs"
                      : "border border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {srv.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 3. District / Location Filter */}
          <div className="grid gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
              <MapPin className="size-3.5 text-primary" />
              সেবার জেলা
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => updateFilter("district", null)}
                className={cn(
                  "transition-all duration-200 text-xs px-3 py-1",
                  !activeDistrict
                    ? "border-primary bg-primary text-primary-foreground font-medium shadow-xs"
                    : "border border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                সকল জেলা
              </Button>
              {districts.map((dst) => (
                <Button
                  key={dst.value}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    updateFilter(
                      "district",
                      activeDistrict === dst.value ? null : dst.value,
                    )
                  }
                  className={cn(
                    "transition-all duration-200 text-xs px-3 py-1",
                    activeDistrict === dst.value
                      ? "border-primary bg-primary text-primary-foreground font-medium shadow-xs"
                      : "border border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {dst.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 4. Minimum Rating */}
          <div className="grid gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
              <Sparkles className="size-3.5 text-primary" />
              সর্বনিম্ন রেটিং
            </label>
            <div className="flex items-center gap-3 pt-0.5">
              <StarRating
                rating={activeRating ? Number(activeRating) : 0}
                totalStars={5}
                size={20}
                gap={3}
                onRate={(value) => {
                  updateFilter("rating", value > 0 ? String(value) : null);
                }}
              />
              {activeRating ? (
                <Badge variant="info">
                  {activeRating}+ স্টার
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  (যে কোনো রেটিং)
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* 5. Experience */}
          <div className="grid gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
              <Award className="size-3.5 text-primary" />
              কাজের অভিজ্ঞতা
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_OPTIONS.map((exp) => (
                <Button
                  key={exp.label}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => updateFilter("experienceMin", exp.value)}
                  className={cn(
                    "transition-all duration-200 text-xs px-3 py-1",
                    (exp.value === null && !activeExperience) ||
                      activeExperience === exp.value
                      ? "border-primary bg-primary text-primary-foreground font-medium shadow-xs"
                      : "border border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {exp.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* 6. Sorting */}
          <div className="grid gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
              <ArrowUpDown className="size-3.5 text-primary" />
              সাজানোর ক্রম (Sort By)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((sort) => (
                <Button
                  key={sort.label}
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => updateFilter("sortBy", sort.value)}
                  className={cn(
                    "transition-all duration-200 text-xs px-3 py-1",
                    (sort.value === null && !activeSort) ||
                      activeSort === sort.value
                      ? "border-primary bg-primary text-primary-foreground font-medium shadow-xs"
                      : "border border-border/60 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {sort.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="border-t border-border/60 bg-muted/30 px-6 py-3.5 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {totalResults != null ? `${totalResults} টি সার্ভেয়ার পাওয়া গেছে` : ""}
          </p>
          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6"
          >
            ফলাফল দেখুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

