'use client';

import { useState } from 'react';
import { MapPinned, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  ToolEmptyState,
  ToolLoadingOverlay,
  ToolTopNav,
} from '@/components/tools/tool-workspace-ui';
import { PantagraphStage } from './PantagraphStage';
import { PantagraphSidebar } from './PantagraphSidebar';
import { PantagraphToolbar } from './PantagraphToolbar';
import { usePantagraphStore } from '../store/usePantagraphStore';

export default function PantagraphLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageLoading = usePantagraphStore((s) => s.imageLoading);
  const formerMap = usePantagraphStore((s) => s.formerMap);
  const currentMap = usePantagraphStore((s) => s.currentMap);
  const isEmpty = !formerMap && !currentMap && !imageLoading;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <ToolTopNav title="ম্যাপ তুলনা" icon={MapPinned} />

      <PantagraphToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="absolute inset-0">
        <PantagraphStage />

        {isEmpty && (
          <div className="absolute inset-0 z-10">
            <ToolEmptyState
              icon={MapPinned}
              title="ম্যাপ তুলনা শুরু করুন"
              description="সাবেক ও হাল ম্যাপ আপলোড করে পয়েন্ট মিলিয়ে তুলনা শুরু করুন।"
              actions={
                <Button className="w-full" onClick={() => setSidebarOpen(true)}>
                  <Settings2 className="size-4" />
                  ম্যাপ ও সেটিংস খুলুন
                </Button>
              }
            />
          </div>
        )}

        {imageLoading && <ToolLoadingOverlay />}
      </div>

      <PantagraphSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
