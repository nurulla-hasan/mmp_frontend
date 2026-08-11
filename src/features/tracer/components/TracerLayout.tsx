'use client';

import { useState } from 'react';
import { PenTool, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  ToolEmptyState,
  ToolLoadingOverlay,
  ToolTopNav,
} from '@/components/tools/tool-workspace-ui';
import { TracerToolbar } from './TracerToolbar';
import { TracerSidebar } from './TracerSidebar';
import TracerCanvas from './TracerCanvas';
import { useTracerStore } from '../store/useTracerStore';

export default function TracerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageLoading = useTracerStore((s) => s.imageLoading);
  const backgroundImage = useTracerStore((s) => s.backgroundImage);
  const layers = useTracerStore((s) => s.layers);
  const pendingPoints = useTracerStore((s) => s.pendingPoints);
  const isEmpty =
    !backgroundImage &&
    !imageLoading &&
    pendingPoints.length === 0 &&
    layers.every((layer) => layer.polygons.length === 0 && layer.labels.length === 0);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <ToolTopNav title="ডিজিটাল ট্রেসার" icon={PenTool} />

      <TracerToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="absolute inset-0">
        <TracerCanvas />

        {isEmpty && (
          <div className="absolute inset-0 z-10">
            <ToolEmptyState
              icon={PenTool}
              title="ডিজিটাল ট্রেসিং শুরু করুন"
              description="পুরানো ম্যাপ আপলোড করুন, তারপর দাগের সীমানা ও নম্বর ট্রেস করুন।"
              actions={
                <Button className="w-full" onClick={() => setSidebarOpen(true)}>
                  <Settings2 className="size-4" />
                  ট্রেসার সেটিংস খুলুন
                </Button>
              }
            />
          </div>
        )}

        {imageLoading && <ToolLoadingOverlay />}
      </div>

      <TracerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
