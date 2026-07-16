'use client';

import { useState } from 'react';
import { PantagraphStage } from './PantagraphStage';
import { PantagraphSidebar } from './PantagraphSidebar';
import { PantagraphToolbar } from './PantagraphToolbar';
import { LegendBadge } from './LegendBadge';

export default function PantagraphLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-background">
      {/* Floating Toolbar */}
      <PantagraphToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Legend badge (bottom-left) */}
      <LegendBadge />

      {/* Main canvas area — full screen */}
      <div className="absolute inset-0">
        <PantagraphStage />
      </div>

      {/* Floating Sidebar (Settings) */}
      <PantagraphSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
}
