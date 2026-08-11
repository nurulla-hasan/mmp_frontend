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

type PantagraphLayoutProps = {
  embedded?: boolean;
  topNavTitle?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
};

export default function PantagraphLayout({
  embedded = false,
  topNavTitle = 'ম্যাপ তুলনা',
  emptyStateTitle = 'সাবেক ও হাল ম্যাপ তুলনা করুন',
  emptyStateDescription = 'সাবেক ও হাল ম্যাপ আপলোড করে matching point বসান, তারপর দুই ম্যাপের অবস্থান ও স্কেল মিলিয়ে নিন।',
}: PantagraphLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageLoading = usePantagraphStore((s) => s.imageLoading);
  const formerMap = usePantagraphStore((s) => s.formerMap);
  const currentMap = usePantagraphStore((s) => s.currentMap);
  const isEmpty = !formerMap && !currentMap && !imageLoading;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {!embedded && <ToolTopNav title={topNavTitle} icon={MapPinned} />}

      <PantagraphToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="absolute inset-0">
        <PantagraphStage />

        {isEmpty && (
          <div className="absolute inset-0 z-10">
            <ToolEmptyState
              icon={MapPinned}
              title={emptyStateTitle}
              description={emptyStateDescription}
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
