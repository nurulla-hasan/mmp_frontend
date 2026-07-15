'use client';

import { useState } from 'react';
import { PantagraphStage } from './PantagraphStage';
import { PantagraphSidebar } from './PantagraphSidebar';
import { PantagraphToolbar } from './PantagraphToolbar';
import { LegendBadge } from './LegendBadge';

export default function PantagraphLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Toolbar (top) */}
      <PantagraphToolbar onOpenSidebar={() => setMobileOpen(true)} />

      {/* Legend badge (bottom-left) */}
      <LegendBadge />

      {/* Main canvas area — full width on mobile, leaves room for sidebar on md+ */}
      <div className="absolute inset-0 top-14 bottom-0 left-0 right-0 md:right-72">
        <PantagraphStage />
      </div>

      {/* Sidebar (right) — hidden on mobile */}
      <PantagraphSidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={() => setMobileOpen(false)} 
      />
    </div>
  );
}
