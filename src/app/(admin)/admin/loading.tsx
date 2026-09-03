import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Header & Filters Bar Skeleton */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="h-12 bg-accent/60 border-b flex items-center px-4 gap-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40 hidden sm:block" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-24 hidden lg:block" />
          <Skeleton className="h-4 w-28 hidden lg:block" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 flex items-center px-4 gap-6 hover:bg-muted/10 transition-colors"
            >
              {/* User Avatar + Name */}
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24 sm:w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Email */}
              <Skeleton className="h-3.5 w-36 hidden sm:block" />

              {/* Role Badge */}
              <Skeleton className="h-5 w-16 rounded-md" />

              {/* Status Badge */}
              <Skeleton className="h-5 w-14 rounded-md hidden md:block" />

              {/* Plots Count */}
              <Skeleton className="h-4 w-12 hidden lg:block" />

              {/* Joined Date */}
              <Skeleton className="h-3.5 w-24 hidden lg:block" />

              {/* Actions Menu */}
              <Skeleton className="size-8 rounded-md ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}

