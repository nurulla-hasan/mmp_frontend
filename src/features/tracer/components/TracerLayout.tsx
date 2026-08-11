'use client';

import { useState } from 'react';
import { PenTool } from 'lucide-react';

import { ToolLoadingOverlay, ToolTopNav } from '@/components/tools/tool-workspace-ui';
import { TracerToolbar } from './TracerToolbar';
import { TracerSidebar } from './TracerSidebar';
import TracerCanvas from './TracerCanvas';
import { useTracerStore } from '../store/useTracerStore';

export default function TracerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageLoading = useTracerStore((s) => s.imageLoading);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <ToolTopNav title="ডিজিটাল ট্রেসার" icon={PenTool} />

      <TracerToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="absolute inset-0">
        <TracerCanvas />
        {imageLoading && <ToolLoadingOverlay />}
      </div>

      <TracerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
