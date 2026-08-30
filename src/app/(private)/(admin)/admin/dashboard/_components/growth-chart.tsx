"use client";

import { Users, UserCheck } from "lucide-react";

interface GrowthChartProps {
  data: {
    month: string;
    users: number;
    subscribers: number;
  }[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.users, d.subscribers, 1)));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">
            Platform Growth Trend
          </span>
          <span className="text-[11px] text-muted-foreground">
            User registrations & active pro subscriptions over time
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="size-2.5 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Users</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2.5 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">Subscribers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 pt-6 items-end min-h-[140px]">
        {data.map((item) => {
          const userHeight = Math.max(8, Math.round((item.users / maxVal) * 100));
          const subHeight = Math.max(8, Math.round((item.subscribers / maxVal) * 100));

          return (
            <div
              key={item.month}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="flex items-end gap-1 w-full justify-center h-28">
                {/* Users bar */}
                <div
                  style={{ height: `${userHeight}%` }}
                  className="w-3 rounded-t-sm bg-primary/80 group-hover:bg-primary transition-all relative"
                  title={`Users: ${item.users}`}
                />
                {/* Subscribers bar */}
                <div
                  style={{ height: `${subHeight}%` }}
                  className="w-3 rounded-t-sm bg-emerald-500/80 group-hover:bg-emerald-500 transition-all relative"
                  title={`Subscribers: ${item.subscribers}`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono truncate">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

