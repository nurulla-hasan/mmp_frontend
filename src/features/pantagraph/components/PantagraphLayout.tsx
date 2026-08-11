'use client';

import { useState } from 'react';
import { MapPinned } from 'lucide-react';

import { ToolLoadingOverlay, ToolTopNav } from '@/components/tools/tool-workspace-ui';
import { PantagraphStage } from './PantagraphStage';
import { PantagraphSidebar } from './PantagraphSidebar';
import { PantagraphToolbar } from './PantagraphToolbar';
import { usePantagraphStore } from '../store/usePantagraphStore';

export default function PantagraphLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageLoading = usePantagraphStore((s) => s.imageLoading);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <ToolTopNav title="ম্যাপ তুলনা" icon={MapPinned} />

      <PantagraphToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="absolute inset-0">
        <PantagraphStage />
        {imageLoading && <ToolLoadingOverlay />}
      </div>

      <PantagraphSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
