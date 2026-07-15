'use client';

import { memo } from 'react';

export const LegendBadge = memo(function LegendBadge() {
  return (
    <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 space-y-1.5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-destructive border border-destructive/60" />
        <span className="text-xs text-muted-foreground">সাবেক ম্যাপ</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-primary border border-primary/60" />
        <span className="text-xs text-muted-foreground">হাল ম্যাপ</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-0.5" style={{ borderTop: '2px dashed #fbbf24' }} />
        <span className="text-xs text-muted-foreground">ম্যাচ লাইন</span>
      </div>
    </div>
  );
});
