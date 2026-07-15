'use client';

import { PantagraphStage } from './PantagraphStage';
import { PantagraphSidebar } from './PantagraphSidebar';
import { PantagraphToolbar } from './PantagraphToolbar';
import { LegendBadge } from './LegendBadge';

export default function PantagraphLayout() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Toolbar (top) */}
      <PantagraphToolbar />

      {/* Legend badge (bottom-left) */}
      <LegendBadge />

      {/* Main canvas area — full width on mobile, leaves room for sidebar on md+ */}
      <div className="absolute inset-0 top-14 bottom-0 left-0 right-0 md:right-72">
        <PantagraphStage />
      </div>

      {/* Sidebar (right) — hidden on mobile */}
      <PantagraphSidebar />
    </div>
  );
}
