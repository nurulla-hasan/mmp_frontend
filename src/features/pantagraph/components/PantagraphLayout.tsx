'use client';

import { useState } from 'react';
import { MapPinned, Settings2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

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
  emptyStateTitle,
  emptyStateDescription,
}: PantagraphLayoutProps) {
  const pathname = usePathname();
  const isStudioContext = pathname.includes('/tools/mouza-map-studio');
  const isEmbedded = embedded || isStudioContext;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const imageLoading = usePantagraphStore((s) => s.imageLoading);
  const formerMap = usePantagraphStore((s) => s.formerMap);
  const currentMap = usePantagraphStore((s) => s.currentMap);
  const isEmpty = !formerMap && !currentMap && !imageLoading;

  const resolvedEmptyTitle =
    emptyStateTitle ??
    (isStudioContext ? 'প্রথমে C.S ও B.S ম্যাপ মিলান' : 'সাবেক ও হাল ম্যাপ তুলনা করুন');
  const resolvedEmptyDescription =
    emptyStateDescription ??
    (isStudioContext
      ? 'C.S ও B.S ম্যাপ আপলোড করে matching point বসিয়ে align করুন। এরপর ফাইনাল এডিটে cleanup, লেখা ও mark যোগ করে শেষে sheet তৈরি করতে পারবেন।'
      : 'সাবেক ও হাল ম্যাপ আপলোড করে matching point বসান, তারপর দুই ম্যাপের অবস্থান ও স্কেল মিলিয়ে নিন।');

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {!isEmbedded && <ToolTopNav title={topNavTitle} icon={MapPinned} />}

      <PantagraphToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="absolute inset-0">
        <PantagraphStage />

        {isEmpty && (
          <div className="absolute inset-0 z-10">
            <ToolEmptyState
              icon={MapPinned}
              title={resolvedEmptyTitle}
              description={resolvedEmptyDescription}
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
